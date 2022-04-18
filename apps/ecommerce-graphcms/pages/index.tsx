import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { Resize } from '@cloudinary/url-gen/actions';
import Button from '@components/Button';
import Container from '@components/Container';
import Layout from '@components/Layout';
import { buildImage } from '@lib/cloudinary';
import styles from '@styles/Page.module.scss';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetStaticPropsContext } from 'next/types';
import React from 'react';

type HomeProps = {
  home: {
    heroLink: string;
    heroText: string;
    heroTitle: string;
    id: string;
    name: string;
    slug: string;
    heroBackground: {
      public_id: string;
      height: number;
      url: string;
      width: number;
    };
  };
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: {
      public_id: string;
      height: number;
      url: string;
      width: number;
    };
  }[];
};

export default function Home({ home, products }: HomeProps) {
  const { heroTitle, heroText, heroLink, heroBackground } = home;
  return (
    <Layout>
      <Head>
        <title>Space Jelly Gear</title>
        <meta name="description" content="Get your Space Jelly gear!" />
      </Head>

      <Container>
        <h1 className="sr-only">Space Jelly Gear</h1>

        <div className={styles.hero}>
          <Link href={heroLink}>
            <a>
              <div className={styles.heroContent}>
                <h2>{heroTitle}</h2>
                <p>{heroText}</p>
              </div>
              <Image
                width={heroBackground.width}
                height={heroBackground.height}
                className={styles.heroImage}
                src={buildImage(heroBackground.public_id).toURL()}
                alt=""
                unoptimized={true}
              />
            </a>
          </Link>
        </div>

        <h2 className={styles.heading}>Featured Gear</h2>

        <ul className={styles.products}>
          {products.map((product) => {
            return (
              <li key={product.slug}>
                <Link href={`/products/${product.slug}`}>
                  <a>
                    <div className={styles.productImage}>
                      <Image
                        width={product.image.width}
                        height={product.image.height}
                        src={buildImage(product.image.public_id)
                          .resize(Resize.scale().width(900).height(900))
                          .toURL()}
                        alt={product.name}
                        unoptimized={true}
                      />
                    </div>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productPrice}>${product.price}</p>
                  </a>
                </Link>
                <p>
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
              </li>
            );
          })}
        </ul>
      </Container>
    </Layout>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  const client = new ApolloClient({
    uri: 'https://api-eu-central-1.graphcms.com/v2/cl23dwaya5cng01z49zwjhdtm/master',
    cache: new InMemoryCache(),
  });

  const resp = await client.query({
    query: gql`
      query PageHome($locale: Locale!) {
        page(where: { slug: "home" }) {
          id
          heroLink
          heroText
          heroTitle
          name
          slug
          heroBackground
          localizations(locales: [$locale]) {
            heroText
            heroTitle
            locale
          }
        }
        products(where: { categories_some: { slug: "featured" } }) {
          id
          image
          name
          price
          slug
        }
      }
    `,
    variables: {
      locale,
    },
  });

  let home = resp.data.page;

  if (home.localizations.length > 0) {
    home = {
      ...home,
      ...home.localizations[0],
    };
  }

  const products = resp.data.products;

  return {
    props: {
      home,
      products,
    },
  };
}
