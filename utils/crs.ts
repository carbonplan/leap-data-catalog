import type { ArrayMeta } from '@/utils/store-schema';

export interface CrsInfo {
  supported: boolean;
  label: string;
  crs?: string; // built-in: 'EPSG:4326' | 'EPSG:3857'
  proj4?: string; // for projected datasets
  bounds?: [number, number, number, number]; // [xMin,yMin,xMax,yMax], source CRS units
  spatialDimensions?: { lat?: string; lon?: string };
}

const isDegrees = (u?: string) => !!u && /degree/i.test(u);
const isMeters = (u?: string) => !!u && /^(m|met(er|re)s?)$/i.test(u.trim());

function coordFor(dim: string, vars: ArrayMeta[]): ArrayMeta | undefined {
  // 1D coordinate array sharing the dim name.
  return vars.find((v) => v.dims.length === 1 && (v.name === dim || v.dims[0] === dim));
}

function units(v?: ArrayMeta): string | undefined {
  return v?.attrs?.['units'] as string | undefined;
}

function statBounds(x?: ArrayMeta, y?: ArrayMeta): [number, number, number, number] | undefined {
  const sx = x?.attrs?.['statistics_approximate'] as { min?: number; max?: number } | undefined;
  const sy = y?.attrs?.['statistics_approximate'] as { min?: number; max?: number } | undefined;
  if (sx?.min == null || sx?.max == null || sy?.min == null || sy?.max == null) return undefined;
  return [Number(sx.min), Number(sy.min), Number(sx.max), Number(sy.max)];
}

// Build a proj4 string from a WKT CRS. Supports the projections used by the
// public catalog (Lambert Conformal Conic); returns null otherwise.
function wktToProj4(wkt: string): string | null {
  const param = (name: string): number | undefined => {
    const m = wkt.match(new RegExp(`PARAMETER\\["${name}",(-?[0-9.eE+]+)\\]`, 'i'));
    return m ? Number(m[1]) : undefined;
  };
  const radius = (() => {
    const m = wkt.match(/SPHEROID\["[^"]*",([0-9.eE+]+),([0-9.eE+]+)/i);
    if (!m) return undefined;
    const a = Number(m[1]);
    const invF = Number(m[2]);
    return { a, invF };
  })();
  const ellps = radius
    ? radius.invF === 0
      ? `+R=${radius.a}`
      : `+a=${radius.a} +rf=${radius.invF}`
    : '+R=6371229';

  if (/Lambert_Conformal_Conic/i.test(wkt)) {
    const sp1 = param('standard_parallel_1');
    const sp2 = param('standard_parallel_2') ?? sp1;
    const lat0 = param('latitude_of_origin') ?? sp1;
    const lon0 = param('central_meridian');
    const x0 = param('false_easting') ?? 0;
    const y0 = param('false_northing') ?? 0;
    if (sp1 == null || lon0 == null) return null;
    return `+proj=lcc +lat_1=${sp1} +lat_2=${sp2} +lat_0=${lat0} +lon_0=${lon0} +x_0=${x0} +y_0=${y0} ${ellps} +units=m +no_defs`;
  }
  return null;
}

// Resolve how to render `variable`'s spatial grid: geographic (4326) or a
// projected CRS (via proj4 + bounds derived from metadata).
export function resolveCrs(variable: ArrayMeta, vars: ArrayMeta[]): CrsInfo {
  const spatial = variable.dims.filter((d) =>
    ['lat', 'latitude', 'y', 'lon', 'longitude', 'x'].includes(d),
  );
  const lonDim = spatial.find((d) => ['lon', 'longitude', 'x'].includes(d));
  const latDim = spatial.find((d) => ['lat', 'latitude', 'y'].includes(d));
  const xc = lonDim ? coordFor(lonDim, vars) : undefined;
  const yc = latDim ? coordFor(latDim, vars) : undefined;

  // Geographic: spatial dims named lat/lon, or coord units in degrees.
  const named4326 =
    (lonDim === 'longitude' || lonDim === 'lon') && (latDim === 'latitude' || latDim === 'lat');
  if (named4326 || isDegrees(units(xc)) || isDegrees(units(yc))) {
    return {
      supported: true,
      label: 'EPSG:4326',
      crs: 'EPSG:4326',
      spatialDimensions: lonDim && latDim ? { lon: lonDim, lat: latDim } : undefined,
    };
  }

  // Projected: coord units in meters → need a proj4 + bounds.
  if (isMeters(units(xc)) || isMeters(units(yc))) {
    const wkt = vars.find((v) => v.attrs?.['crs_wkt'])?.attrs?.['crs_wkt'] as string | undefined;
    const proj4 = wkt ? wktToProj4(wkt) : null;
    const bounds = statBounds(xc, yc);
    if (proj4 && bounds) {
      return {
        supported: true,
        label: /lcc/.test(proj4) ? 'Lambert Conformal' : 'projected',
        proj4,
        bounds,
        spatialDimensions: lonDim && latDim ? { lon: lonDim, lat: latDim } : undefined,
      };
    }
    return { supported: false, label: 'projected CRS (unsupported)' };
  }

  // Unknown: assume geographic but flag it.
  return { supported: true, label: 'EPSG:4326 (assumed)', crs: 'EPSG:4326' };
}
