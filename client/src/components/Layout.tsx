import NavBar from "./NavBar.tsx";

export default function Layout({ children, navChildren }: {
  children?: React.ReactNode,
  navChildren?: React.ReactNode
}) {

  return (
    <>
      <NavBar>{navChildren}</NavBar>
      <div className="page">
        {children}
      </div>
    </>
  );
}
