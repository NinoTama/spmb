import { notFound } from "next/navigation";
import PageAdmin from "./page-admin";
import PagePrincipal from "./page-principal";
import PageStudent from "./page-student";

const pages = {
  admin: PageAdmin,
  principal: PagePrincipal,
  student: PageStudent,
};

export default async function LoginPage({ params, searchParams }) {
  const { role } = await params;
  const Page = pages[role];
  if (!Page) notFound();
  return <Page searchParams={searchParams} />;
}
