import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MailMirror - Email Development Platform',
  description: 'Build and test email templates with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
