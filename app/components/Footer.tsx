import Link from "next/link";

type FooterProps = {
  className?: string;
  navClassName?: string;
  linkClassName?: string;
};

export default function Footer({
  className = "",
  navClassName = "",
  linkClassName = "",
}: FooterProps) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Read the blog" },
    { href: "/archives", label: "Browse the archives" },
  ];

  return (
    <footer className={className}>
      <p>Made with ❤️ by INKYLABS LIMITED</p>
      <div className={navClassName}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClassName}>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
