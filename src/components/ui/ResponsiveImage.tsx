import type { ImgHTMLAttributes } from 'react'

export interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string
  srcSet?: string
  avifSrcSet?: string
  sizes?: string
  lazy?: boolean
}

const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

export function ResponsiveImage({
  src,
  srcSet,
  avifSrcSet,
  sizes = DEFAULT_SIZES,
  lazy = true,
  className,
  alt,
  ...imgProps
}: ResponsiveImageProps) {
  if (avifSrcSet) {
    return (
      <picture>
        <source srcSet={avifSrcSet} sizes={sizes} type="image/avif" />
        {srcSet ? <source srcSet={srcSet} sizes={sizes} type="image/webp" /> : null}
        <img alt={alt || ''} src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} loading={(lazy ? 'lazy' : undefined) as ImgHTMLAttributes<HTMLImageElement>['loading']} decoding="async" className={className} {...imgProps} />
      </picture>
    )
  }

  return (
    <img
      alt={alt || ''}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      loading={(lazy ? 'lazy' : undefined) as ImgHTMLAttributes<HTMLImageElement>['loading']}
      decoding="async"
      className={className}
      {...imgProps}
    />
  )
}
