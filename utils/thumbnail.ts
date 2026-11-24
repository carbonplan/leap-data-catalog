// The mockup's photos for the four featured datasets come first.
const photos = [
  '1583325958573-3c89e40551ad',
  '1454789476662-53eb23ba5907',
  '1513553404607-988bf2703777',
  '1584267385494-9fdd9a71ad75',
  '1580193813605-a5c78b4ee01a',
  '1518627675569-e9d4fb90cdb5',
  '1563974318767-a4de855d7b43',
  '1584267759777-8a74a4f72a91',
]

export const getThumbnail = (index: number) =>
  `https://images.unsplash.com/photo-${photos[index % photos.length]}`

export const sizedPhoto = (url: string, width: number) =>
  `${url}?w=${width}&q=60&fm=webp&fit=crop`
