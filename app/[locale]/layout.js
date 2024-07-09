import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Firstbot - Carpenter",
  description: "Carpenter is an open-source AI project that writes and runs serverless code snippets in the cloud",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="https://s3.ap-northeast-1.wasabisys.com/firstbot-landing/favicon.ico" sizes="any" />
        <script async defer src="https://buttons.github.io/buttons.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
