import { type GetServerSideProps, type NextPage } from "next";
import { useSession } from "next-auth/react";

import { trpc } from "utils/trpc";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {
            query: context.query
        }
    }
}
const Authorize: NextPage = () => {
    const router = useRouter();
    const session = useSession();
    const { client_id, redirect_uri, response_type, scope } = router.query;

    if (session.data?.user?.id) {
        
    }
    const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

    return (
        <>
        </>
    );
};

export default Authorize;
