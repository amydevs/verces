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
    
    const authorize = trpc.oauth.authorize.useMutation();

    return (
        <>
            <button onClick={() => authorize.mutate(router.query as any)}></button>
        </>
    );
};

export default Authorize;
