'use client'
import { StoreFormat } from '@/types/types'
import { resolveCrs } from '@/utils/crs'
import type { ArrayMeta } from '@/utils/store-schema'
import { Colorbar } from '@carbonplan/components'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Flex, Select, Slider, Text } from 'theme-ui'

const COLORMAP = [
  '#313695',
  '#4575b4',
  '#74add1',
  '#abd9e9',
  '#e0f3f8',
  '#ffffbf',
  '#fee090',
  '#fdae61',
  '#f46d43',
  '#d73027',
  '#a50026',
]

const LAT = new Set(['lat', 'latitude', 'y'])
const LON = new Set(['lon', 'longitude', 'x'])
const isSpatial = (d: string) => LAT.has(d) || LON.has(d)

// zarr-layer fetches whole chunks; above this we don't auto-render.
const MAX_CHUNK_MB = 8

// A variable is renderable if it has >=2 dims with >=2 spatial, and is not
// itself a coordinate/CRS array.
function renderable(v: ArrayMeta): boolean {
  if (v.dims.length < 2 || v.dims.filter(isSpatial).length < 2) return false
  const sn = String(v.attrs?.['standard_name'] ?? '')
  if (/^(latitude|longitude|projection_[xy]_coordinate)$/.test(sn)) return false
  if (v.attrs?.['crs_wkt']) return false
  return true
}

function chunkMB(v: ArrayMeta): number {
  const m = v.dtype.match(/(\d+)/)
  const bytes = m ? Math.max(1, Number(m[1]) / 8) : 4
  return v.chunks ? (v.chunks.reduce((a, c) => a * c, 1) * bytes) / 1e6 : 0
}

function defaultClim(v: ArrayMeta): [number, number] {
  const a: Record<string, unknown> = v.attrs ?? {}
  const range = a['valid_range']
  if (Array.isArray(range) && range.length === 2)
    return [Number(range[0]), Number(range[1])]
  const actual = Array.isArray(a['actual_range'])
    ? (a['actual_range'] as unknown[])
    : undefined
  const stats = a['statistics_approximate'] as
    { min?: number; max?: number } | undefined
  const lo = a['valid_min'] ?? a['vmin'] ?? actual?.[0] ?? stats?.min
  const hi = a['valid_max'] ?? a['vmax'] ?? actual?.[1] ?? stats?.max
  if (lo != null && hi != null) return [Number(lo), Number(hi)]
  const u = String(a['units'] ?? '')
  if (/degree_?C|celsius/i.test(u)) return [-30, 40]
  if (/^K$|kelvin/i.test(u)) return [240, 320]
  if (/percent|%/i.test(u)) return [0, 100]
  return [0, 1]
}

function fmtVal(x: number): string {
  if (!isFinite(x)) return '—'
  const a = Math.abs(x)
  if (a !== 0 && (a >= 10000 || a < 0.01)) return x.toExponential(2)
  return x.toFixed(2)
}

function pickDefault(vars: ArrayMeta[]): ArrayMeta | undefined {
  const cont = vars.filter(
    (v) => String(v.attrs?.['units']) !== '1' && !/^categorical/i.test(v.name),
  )
  const small = cont.filter((v) => chunkMB(v) <= MAX_CHUNK_MB)
  const pool = small.length ? small : cont
  return pool.find((v) => /temp/i.test(v.name)) ?? pool[0] ?? vars[0]
}

// Build ArrayMeta[] from a plain (consolidated) zarr store via zarrita.
async function arraysFromZarr(url: string): Promise<ArrayMeta[]> {
  const zarr = await import('zarrita')
  const base = new zarr.FetchStore(url.replace(/\/$/, ''))
  const store = await zarr.withConsolidatedMetadata(base)
  const arrays: ArrayMeta[] = []
  for (const entry of store.contents()) {
    if (entry.kind !== 'array') continue
    const arr = await zarr.open(zarr.root(store).resolve(entry.path), {
      kind: 'array',
    })
    const dimAttr = arr.attrs?.['_ARRAY_DIMENSIONS'] as string[] | undefined
    const dims = dimAttr ?? arr.shape.map((_, i) => `dim_${i}`)
    arrays.push({
      name: entry.path.split('/').filter(Boolean).pop() ?? entry.path,
      path: entry.path.replace(/^\//, ''),
      dtype: String(arr.dtype ?? ''),
      shape: [...arr.shape],
      dims,
      chunks: [...(arr.chunks ?? [])],
      attrs: arr.attrs as Record<string, unknown> | undefined,
    })
  }
  return arrays
}

interface ZarrMapViewerProps {
  url: string
  format: StoreFormat
  color: string
  bbox?: [number, number, number, number]
}

export const ZarrMapViewer: React.FC<ZarrMapViewerProps> = ({
  url,
  format,
  color,
  bbox,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const storeRef = useRef<any>(null)

  const [arrays, setArrays] = useState<ArrayMeta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('loading…')
  const [mapReady, setMapReady] = useState(false)
  const [storeReady, setStoreReady] = useState(false)

  const [variable, setVariable] = useState<string>('')
  const [clim, setClim] = useState<[number, number]>([0, 1])
  const [sel, setSel] = useState<Record<string, number>>({})
  const [force, setForce] = useState(false) // opt-in to render an oversized-chunk var

  const renderables = useMemo(() => arrays.filter(renderable), [arrays])
  const defaultVar = useMemo(() => pickDefault(renderables), [renderables])
  const current = useMemo(
    () => renderables.find((v) => v.path === variable) ?? defaultVar,
    [renderables, variable, defaultVar],
  )
  const crsInfo = useMemo(
    () => (current ? resolveCrs(current, arrays) : null),
    [current, arrays],
  )

  // init selection when renderable set changes
  useEffect(() => {
    if (!current) return
    setVariable(current.path)
    setForce(false)
    setClim(defaultClim(current))
    const extra: Record<string, number> = {}
    current.dims.forEach((d) => {
      if (!isSpatial(d)) extra[d] = 0
    })
    setSel(extra)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.path])

  // mount map + open store, walk schema
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    const ac = new AbortController()

    ;(async () => {
      try {
        const mod: any = await import('maplibre-gl')
        const maplibregl = mod.default ?? mod
        if (cancelled || !containerRef.current) return

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id: 'bg',
                type: 'background',
                paint: { 'background-color': '#1a1a1a' },
              },
            ],
          },
          center: [0, 0],
          zoom: 0,
          attributionControl: false,
        })
        mapRef.current = map
        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          'top-right',
        )
        map.on('load', () => {
          if (cancelled) return
          map.resize()
          setMapReady(true)
        })

        if (format === 'icechunk') {
          const { openIcechunkStore, arraysFromStore } =
            await import('@/utils/store-schema')
          const store = await openIcechunkStore(url, ac.signal)
          if (cancelled) return
          storeRef.current = store
          setArrays(arraysFromStore(store))
        } else {
          setArrays(await arraysFromZarr(url))
        }
        if (!cancelled) {
          setStoreReady(true)
          setStatus('')
        }
      } catch (e) {
        if (cancelled || (e as Error).name === 'AbortError') return
        const msg = (e as Error).message ?? String(e)
        // Browser-blocked fetches (bucket without CORS) surface as opaque
        // network errors; explain instead of dumping the raw message.
        setError(
          /NetworkError|Failed to fetch|CORS/i.test(msg)
            ? 'This dataset’s bucket does not allow browser access (no CORS configuration), so the map viewer cannot read it. Use the load-dataset snippet instead.'
            : msg,
        )
        setStatus('')
      }
    })()

    return () => {
      cancelled = true
      ac.abort()
      layerRef.current = null
      setMapReady(false)
      setStoreReady(false)
      mapRef.current?.remove?.()
      mapRef.current = null
      storeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, format])

  // (re)create layer
  useEffect(() => {
    if (!mapReady || !storeReady) return
    let stale = false
    ;(async () => {
      const map = mapRef.current
      if (!map || !current || !crsInfo?.supported) return
      if (format === 'icechunk' && !storeRef.current) return
      // Don't auto-fetch oversized chunks; wait for explicit opt-in.
      if (chunkMB(current) > MAX_CHUNK_MB && !force) {
        if (layerRef.current && map.getLayer?.('zarr')) map.removeLayer('zarr')
        layerRef.current = null
        return
      }
      const { ZarrLayer } = await import('@carbonplan/zarr-layer')
      if (stale || !mapRef.current) return
      if (layerRef.current && map.getLayer?.('zarr')) map.removeLayer('zarr')

      const selector: Record<string, { selected: number; type: 'index' }> = {}
      for (const [d, i] of Object.entries(sel))
        selector[d] = { selected: i, type: 'index' }

      const layer = new ZarrLayer({
        id: 'zarr',
        ...(storeRef.current ? { store: storeRef.current } : { source: url }),
        variable: current.path,
        zarrVersion: format === 'icechunk' ? 3 : undefined,
        colormap: COLORMAP,
        clim,
        selector,
        spatialDimensions: crsInfo.spatialDimensions,
        ...(crsInfo.proj4
          ? { proj4: crsInfo.proj4, bounds: crsInfo.bounds }
          : { crs: crsInfo.crs }),
        onLoadingStateChange: (s: { loading: boolean; error?: Error | null }) =>
          setStatus(
            s.error ? `error: ${s.error.message}` : s.loading ? 'loading…' : '',
          ),
      })
      map.addLayer(layer)
      layerRef.current = layer

      const bb = bbox
      if (Array.isArray(bb) && bb.length === 4) {
        const [w, s, e, n] = bb.map(Number)
        try {
          map.fitBounds(
            [
              [w, s],
              [e, n],
            ],
            { padding: 12, duration: 0 },
          )
        } catch {
          // ignore bad bounds
        }
      }
    })()
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, storeReady, current?.path, crsInfo?.label, force])

  // live updates
  useEffect(() => {
    layerRef.current?.setClim?.(clim)
  }, [clim])
  useEffect(() => {
    const selector: Record<string, { selected: number; type: 'index' }> = {}
    for (const [d, i] of Object.entries(sel))
      selector[d] = { selected: i, type: 'index' }
    layerRef.current?.setSelector?.(selector)
  }, [sel])

  const extraDims = current ? current.dims.filter((d) => !isSpatial(d)) : []
  const dimSize = (d: string): number =>
    current ? (current.shape[current.dims.indexOf(d)] ?? 1) : 1

  // Only reveal the map canvas when a layer will actually render; otherwise a
  // centered overlay explains why not (loading, oversized chunks, bad CRS).
  const willRender = Boolean(
    storeReady &&
    current &&
    crsInfo?.supported &&
    (chunkMB(current) <= MAX_CHUNK_MB || force),
  )
  const overlayMessage = !storeReady
    ? 'loading…'
    : renderables.length === 0
      ? 'No spatially-renderable variables'
      : crsInfo && !crsInfo.supported
        ? `Unsupported projection (${crsInfo.label}) — cannot render`
        : null
  const oversized = Boolean(
    storeReady && current && chunkMB(current) > MAX_CHUNK_MB && !force,
  )
  const rawUnits = String(current?.attrs?.['units'] ?? '')
  const units = rawUnits && rawUnits !== '1' ? rawUnits : ''

  if (error) {
    return (
      <Box sx={{ fontSize: 0, fontFamily: 'mono', color: 'red', mt: 2 }}>
        Error: {error}
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: [300, 400, 480, 480],
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'muted',
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            position: 'absolute',
            inset: 0,
            visibility: willRender ? 'visible' : 'hidden',
          }}
        />
        {!willRender && (
          <Flex
            sx={{
              position: 'absolute',
              inset: 0,
              flexDirection: 'column',
              gap: 3,
              alignItems: 'center',
              justifyContent: 'center',
              bg: 'background',
              textAlign: 'center',
              px: 3,
            }}
          >
            {oversized ? (
              <>
                <Text
                  sx={{
                    fontSize: [1, 1, 1, 2],
                    fontFamily: 'mono',
                    color: 'orange',
                  }}
                >
                  ~{current ? chunkMB(current).toFixed(0) : ''} MB/chunk — too
                  large to render automatically
                </Text>
                <Box
                  as='button'
                  onClick={() => setForce(true)}
                  sx={{
                    fontSize: [1, 1, 1, 2],
                    fontFamily: 'mono',
                    letterSpacing: 'mono',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    bg: 'transparent',
                    color,
                    border: '1px solid',
                    borderColor: 'muted',
                    px: 3,
                    py: 2,
                    '&:hover': { borderColor: color },
                  }}
                >
                  Render anyway
                </Box>
              </>
            ) : (
              <Text
                sx={{
                  fontSize: [1, 1, 1, 2],
                  fontFamily: 'mono',
                  color: 'secondary',
                }}
              >
                {overlayMessage}
              </Text>
            )}
          </Flex>
        )}
      </Box>

      <Flex sx={{ gap: 3, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {renderables.length > 0 && (
          <Box>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: 'mono',
                color: 'secondary',
                textTransform: 'uppercase',
                letterSpacing: 'mono',
                mr: 1,
              }}
            >
              Variable
            </Text>
            <Select
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              sx={{
                fontSize: 0,
                fontFamily: 'mono',
                display: 'inline-block',
                minWidth: 120,
              }}
            >
              {renderables.map((v) => (
                <option key={v.path} value={v.path}>
                  {v.name}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {willRender && (
          <Colorbar
            horizontal
            colormap={COLORMAP}
            clim={clim}
            setClim={setClim}
            setClimStep={Math.max(
              (Math.abs(clim[1] - clim[0]) || 1) / 200,
              1e-6,
            )}
            format={(d: number | string) => fmtVal(Number(d))}
            units={units || undefined}
            width={140}
            sx={{ mt: '2px' }}
          />
        )}

        {crsInfo && (
          <Text sx={{ fontSize: 0, fontFamily: 'mono', color: 'secondary' }}>
            {crsInfo.label}
          </Text>
        )}
        {force && current && chunkMB(current) > MAX_CHUNK_MB && (
          <Text sx={{ fontSize: 0, fontFamily: 'mono', color: 'orange' }}>
            ~{chunkMB(current).toFixed(0)} MB/chunk
          </Text>
        )}
        {status && (
          <Text sx={{ fontSize: 0, fontFamily: 'mono', color: 'secondary' }}>
            {status}
          </Text>
        )}
      </Flex>

      {extraDims.map((d) => (
        <Box key={d} sx={{ mt: 2, maxWidth: 320 }}>
          <Text
            sx={{
              fontSize: 0,
              fontFamily: 'mono',
              color: 'secondary',
              textTransform: 'uppercase',
              letterSpacing: 'mono',
            }}
          >
            {d}: {sel[d] ?? 0} / {dimSize(d) - 1}
          </Text>
          <Slider
            min={0}
            max={Math.max(0, dimSize(d) - 1)}
            step={1}
            value={sel[d] ?? 0}
            onChange={(e) =>
              setSel((s) => ({ ...s, [d]: Number(e.target.value) }))
            }
            sx={{ mt: 1, color }}
          />
        </Box>
      ))}
    </Box>
  )
}
