
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Admin Login | Emax-Electrical - Shop Easy</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mien-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting to admin login...</p>
      </div>
    </>
  );
}
