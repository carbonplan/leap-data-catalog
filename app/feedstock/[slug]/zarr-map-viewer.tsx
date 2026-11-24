'use client'
import { arraysFromStore, type ArrayMeta } from '@/utils/store-schema'
import { Colorbar } from '@carbonplan/components'
import 'maplibre-gl/dist/maplibre-gl.css'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const LAT = new Set(['lat', 'latitude'])
const LON = new Set(['lon', 'longitude'])
const isSpatial = (d: string) => LAT.has(d) || LON.has(d)

const renderable = (v: ArrayMeta) =>
  v.dims.some((d) => LAT.has(d)) && v.dims.some((d) => LON.has(d))

function defaultClim(v: ArrayMeta): [number, number] {
  const a = v.attrs ?? {}
  const range = [a['actual_range'], a['valid_range']].find(Array.isArray) ?? []
  const lo = a['valid_min'] ?? range[0]
  const hi = a['valid_max'] ?? range[1]
  if (lo != null && hi != null) return [Number(lo), Number(hi)]
  return [0, 1]
}

const fmtVal = (x: number) =>
  x !== 0 && (Math.abs(x) >= 10000 || Math.abs(x) < 0.01)
    ? x.toExponential(2)
    : x.toFixed(2)

interface ZarrMapViewerProps {
  url: string
  color: string
}

export const ZarrMapViewer: React.FC<ZarrMapViewerProps> = ({ url, color }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const storeRef = useRef<any>(null)
  const layerClassRef = useRef<any>(null)

  const [arrays, setArrays] = useState<ArrayMeta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('loading...')
  const [mapReady, setMapReady] = useState(false)
  const [storeReady, setStoreReady] = useState(false)
  const [variable, setVariable] = useState('')
  const [clim, setClim] = useState<[number, number]>([0, 1])
  const [sel, setSel] = useState<Record<string, number>>({})

  const renderables = useMemo(() => arrays.filter(renderable), [arrays])
  const current = renderables.find((v) => v.path === variable)

  // A new variable resets clim and the non-spatial selectors.
  const selectVariable = useCallback((v: ArrayMeta) => {
    setVariable(v.path)
    setClim(defaultClim(v))
    setSel(
      Object.fromEntries(
        v.dims.filter((d) => !isSpatial(d)).map((d) => [d, 0]),
      ),
    )
  }, [])

  // Mount the map and open the store.
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    const ac = new AbortController()
    let ro: ResizeObserver | undefined

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
        // The viewer mounts inside a collapsed expander, so the container starts at zero size.
        ro = new ResizeObserver(() => map.resize())
        ro.observe(containerRef.current)
        map.on('load', () => {
          if (cancelled) return
          setMapReady(true)
        })

        // Load the layer class here too, so layers are built synchronously with current state.
        const [{ IcechunkStore }, { ZarrLayer }] = await Promise.all([
          import('icechunk-js'),
          import('@carbonplan/zarr-layer'),
        ])
        const store = await IcechunkStore.open(url, {
          signal: ac.signal,
        })
        if (cancelled) return
        storeRef.current = store
        layerClassRef.current = ZarrLayer
        const found = arraysFromStore(store)
        const first = found.find(renderable)
        setArrays(found)
        if (first) selectVariable(first)
        setStoreReady(true)
        setStatus('')
      } catch (e) {
        if (cancelled || (e as Error).name === 'AbortError') return
        setError((e as Error).message ?? String(e))
      }
    })()

    return () => {
      cancelled = true
      ac.abort()
      ro?.disconnect()
      layerRef.current = null
      setMapReady(false)
      setStoreReady(false)
      mapRef.current?.remove?.()
      mapRef.current = null
      storeRef.current = null
    }
  }, [url, selectVariable])

  // (Re)create the layer when the variable changes.
  useEffect(() => {
    if (!mapReady || !storeReady || !current) return
    const map = mapRef.current
    try {
      if (map.getLayer('zarr')) map.removeLayer('zarr')
      const layer = new layerClassRef.current({
        id: 'zarr',
        store: storeRef.current,
        variable: current.path,
        zarrVersion: 3,
        colormap: COLORMAP,
        clim,
        selector: toSelector(sel),
        crs: 'EPSG:4326',
        spatialDimensions: {
          lat: current.dims.find((d) => LAT.has(d)),
          lon: current.dims.find((d) => LON.has(d)),
        },
        onLoadingStateChange: (s: { loading: boolean; error?: Error | null }) =>
          setStatus(
            s.error
              ? `error: ${s.error.message}`
              : s.loading
                ? 'loading...'
                : '',
          ),
      })
      map.addLayer(layer)
      layerRef.current = layer
    } catch (e) {
      layerRef.current = null
      // reports a failure of an external system (the map), not derived state
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(`error: ${(e as Error).message}`)
    }
    // clim and sel are applied live below; only a new variable rebuilds the layer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, storeReady, current?.path])

  useEffect(() => {
    layerRef.current?.setClim(clim)
  }, [clim])
  useEffect(() => {
    layerRef.current
      ?.setSelector(toSelector(sel))
      .catch((e: Error) => setStatus(`error: ${e.message}`))
  }, [sel])

  const extraDims = current?.dims.filter((d) => !isSpatial(d)) ?? []
  const units = String(current?.attrs?.['units'] ?? '')

  if (error) {
    return (
      <Box sx={{ fontSize: 0, fontFamily: 'mono', color: 'red', mt: 2 }}>
        Error: {error}
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }} data-testid='zarr-map-viewer'>
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
        <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      </Box>

      <Flex sx={{ gap: 3, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {renderables.length > 0 && (
          <Select
            value={variable}
            onChange={(e) =>
              selectVariable(
                renderables.find((v) => v.path === e.target.value)!,
              )
            }
            sx={{
              fontSize: 0,
              fontFamily: 'mono',
              width: 'auto',
              minWidth: 120,
            }}
          >
            {renderables.map((v) => (
              <option key={v.path} value={v.path}>
                {v.name}
              </option>
            ))}
          </Select>
        )}
        {current && (
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
        {status && (
          <Text sx={{ fontSize: 0, fontFamily: 'mono', color: 'secondary' }}>
            {status}
          </Text>
        )}
      </Flex>

      {extraDims.map((d) => {
        const size = current!.shape[current!.dims.indexOf(d)] ?? 1
        return (
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
              {d}: {sel[d] ?? 0} / {size - 1}
            </Text>
            <Slider
              min={0}
              max={Math.max(0, size - 1)}
              step={1}
              value={sel[d] ?? 0}
              onChange={(e) =>
                setSel((s) => ({ ...s, [d]: Number(e.target.value) }))
              }
              sx={{ mt: 1, color }}
            />
          </Box>
        )
      })}
    </Box>
  )
}

function toSelector(sel: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(sel).map(([d, i]) => [
      d,
      { selected: i, type: 'index' as const },
    ]),
  )
}
