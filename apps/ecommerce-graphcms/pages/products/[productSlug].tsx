import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { Resize } from '@cloudinary/url-gen/actions';
import Button from '@components/Button';
import Container from '@components/Container';
import Layout from '@components/Layout';
import { buildImage } from '@lib/cloudinary';
import styles from '@styles/Product.module.scss';
import Head from 'next/head';
import Image from 'next/image';
import type { GetStaticPathsContext, GetStaticPropsContext } from 'next/types';

type ProductProps = {
  product: {
    id: string;
    name: string;
    image: {
      public_id: string;
      url: string;
      height: number;
      width: number;
    };
    price: number;
    description: {
      html: string;
    };
    slug: string;
  };
};

export default function Product({ product }: ProductProps) {
  return (
    <Layout>
      <Head>
        <title>{product.name}</title>
        <meta
          name="description"
          content={`Find ${product.name} at StoreName`}
        />
      </Head>

      <Container>
        <div className={styles.productWrapper}>
          <div className={styles.productImage}>
            <Image
              width={900}
              height={900}
              src={buildImage(product.image.public_id)
                .resize(Resize.scale().width(900).height(900))
                .toURL()}
              alt={product.name}
              unoptimized={true}
            />
          </div>
          <div className={styles.productContent}>
            <h1>{product.name}</h1>
            <div
              className={styles.productDescription}
              dangerouslySetInnerHTML={{
                __html: product.description?.html,
              }}
            />
            <p className={styles.productPrice}>${product.price}</p>
            <p className={styles.productBuy}>
              <Button
                className="snipcart-add-item"
                data-item-id={product.id}
                data-item-price={product.price}
                data-item-url={`products/${product.slug}`}
                data-item-image={product.image.url}
                data-item-name={product.name}
              >
                Add to Cart
              </Button>
            </p>
          </div>
        </div>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({
  params,
  locale,
}: GetStaticPropsContext<{ productSlug: string }>) {
  const client = new ApolloClient({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cl23dwaya5cng01z49zwjhdtm/master',
    cache: new InMemoryCache(),
  });

  const resp = await client.query({
    query: gql`
      query PageProduct($slug: String, $locale: Locale!) {
        product(where: { slug: $slug }) {
          id
          name
          image
          price
          slug
          description {
            html
          }
          localizations(locales: [$locale]) {
            description {
              html
            }
            locale
          }
        }
      }
    `,
    variables: {
      slug: params.productSlug,
      locale,
    },
  });

  let product = resp.data.product;

  if (product.localizations.length > 0) {
    product = {
      ...product,
      ...product.localizations[0],
    };
  }

  return {
    props: { product },
  };
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const client = new ApolloClient({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cl23dwaya5cng01z49zwjhdtm/master',
    cache: new InMemoryCache(),
  });

  const resp = await client.query<{ products: { id: string; slug: string }[] }>(
    {
      query: gql`
        query PageProducts {
          products {
            id
            slug
          }
        }
      `,
    }
  );

  const paths = resp.data.products.map((product) => ({
    params: {
      productSlug: product.slug,
    },
  }));

  return {
    paths: [
      ...paths,
      ...paths.flatMap((path) => {
        return locales.map((locale) => {
          return {
            ...path,
            locale,
          };
        });
      }),
    ],
    fallback: false,
  };
}
