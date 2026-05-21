import NavBar from "./NavBar.tsx";

export default function Layout({ children, navChildren, navCenter }: {
  children?: React.ReactNode,
  navChildren?: React.ReactNode,
  navCenter?: React.ReactNode
}) {

  return (
    <>
      <NavBar navCenter={navCenter}>{navChildren}</NavBar>
      <div className="page">
        {children}
      </div>
    </>
  );
}
