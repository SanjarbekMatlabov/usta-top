const CATEGORY_IMAGE_QUERY = {
  'Elektrik': 'electrician tools wiring',
  'Santexnik': 'plumber pipe repair',
  'Konditsioner ustasi': 'air conditioner repair',
  'Maishiy texnika ustasi': 'home appliance repair',
  'Mebel ustasi': 'furniture repair woodworking',
  'Eshik-deraza ustasi': 'door window repair',
  "Bo'yoqchi": 'painting renovation',
  'Kafel ustasi': 'tile installation bathroom',
  'Payvandchi': 'welding metal workshop',
  'Tom ustasi': 'roof repair construction',
  'Gipsokarton ustasi': 'drywall interior construction',
  'Pol ustasi': 'flooring laminate installation',
  'Signalizatsiya/Kamera ustasi': 'security camera installation',
  'Internet/Kabel ustasi': 'network cable installation',
  'Tozalash xizmati': 'home cleaning service',
};

const FALLBACK_QUERY = 'home repair tools';

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/['`"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';

const makeImageUrl = (query, seed, width, height) => {
  const safeSeed = `${slugify(query)}-${seed}`;
  return `https://picsum.photos/seed/${encodeURIComponent(safeSeed)}/${width}/${height}`;
};
export function buildProviderMedia(provider) {
  const query = CATEGORY_IMAGE_QUERY[provider.category] || FALLBACK_QUERY;
  const coverImage = makeImageUrl(query, provider.id, 1200, 900);
  const galleryImages = [1, 2, 3, 4, 5, 6].map((index) =>
    makeImageUrl(`${query} service work`, provider.id * 10 + index, 900, 700),
  );

  return {
    coverImage,
    galleryImages,
    avatarImage: makeImageUrl(query, provider.id * 100, 500, 500),
  };
}
