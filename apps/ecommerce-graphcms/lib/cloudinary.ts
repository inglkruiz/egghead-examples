import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'inglkruiz',
  },
  url: {
    secure: true,
  },
});

export function buildImage(src: string) {
  return cld.image(src).quality('auto').format('auto');
}
