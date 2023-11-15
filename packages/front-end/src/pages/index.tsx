import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Head from 'next/head';
import { Inter } from '@next/font/google';
import { GetServerSidePropsContext } from 'next';

const inter = Inter({ subsets: ['latin'] });

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // if SESSION_TOKEN is set, then hit our back-end to check authentication
  // status. if the token is valid, then we'll get back the user's info and pass
  // it to the HomeProps object.
  let sessionToken = ctx.req.cookies?.SESSION_TOKEN;

  console.log('SESSION_TOKEN in index Next.js:', sessionToken);

  // Check if the token is passed as a query parameter
  if (!sessionToken && ctx.query.token) {
    sessionToken = ctx.query.token as string;
  }

  console.log('BACKEND_HOST', process.env.BACK_END_HOST);

  if (sessionToken) {
    // console.log('SESSION_TOKEN:', ctx.req.cookies.SESSION_TOKEN);
    const authRes = await fetch(
      `http://${process.env.BACK_END_HOST}:50000/auth`,
      {
        method: 'GET',
        headers: {
          Cookie: `SESSION_TOKEN=${encodeURIComponent(
            ctx.req.cookies.SESSION_TOKEN
          )}`,
        },
      }
    )
      .then((r) => r.json())
      .catch((e) => console.error('Failed to fetch auth state during SSR!', e));

    if (process.env.NODE_ENV !== 'production') {
      console.debug('authRes,', authRes);
    }

    console.log('authRes', authRes);

    const { success, data } = authRes;
    if (success && data?.user?.id) {
      console.log('Success:', success, 'Data?user?.id:', data.user.id);
      return {
        props: {
          sess: {
            id: data.user.id,
            username: data.user.username,
            displayName: data.user.displayName,
          },
        } satisfies HomeProps,
      };
    }
  } else {
    // Cookie not present, we're not logged in!
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Cookie not present, refusing to check auth status!');
    }
  }

  return {
    props: {},
  };
}

export type HomeProps = {
  sess?: {
    id: number;
    username: string;
    displayName: string;
  };
};

export default function Home({ sess }: HomeProps) {
  console.log('Sess before return:', sess);

  return (
    <>
      <Head>
        <title>
          Atllas - Take Home Assignment for React Native and Javascript
          Developer
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/public/favicon.ico" />
      </Head>
      <main className={clsx('w-full h-full', inter.className)}>
        <h1 className="border-b border-neutral-300 px-4 py-2 text-2xl font-medium text-center">
          User Profile
        </h1>
        <div className="p-4">
          <p className="text-neutral-500">{`How ya goin, ${
            sess?.displayName || sess?.username || 'stranger'
          }?`}</p>
        </div>
        <div className="p-4"></div>
      </main>
    </>
  );
}
