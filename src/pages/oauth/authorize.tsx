import { type GetServerSideProps, type NextPage } from "next";
import { getProviders, signIn, useSession } from "next-auth/react";

import { trpc } from "utils/trpc";
import { useRouter } from "next/router";
import type { ParsedUrlQuery } from "querystring";

interface AuthorizeProps {
    query: ParsedUrlQuery;
    providers: Awaited<ReturnType<typeof getProviders>>
}

export const getServerSideProps: GetServerSideProps<AuthorizeProps> = async (context) => {
    const providers = await getProviders();
    return {
        props: {
            query: context.query,
            providers
        }
    }
}
const Authorize: NextPage<AuthorizeProps> = (props) => {
    const router = useRouter();
    const session = useSession();

    const authorize = trpc.oauth.authorize.useMutation({
        onSuccess: ({ code }) => {
            router.push(`${props.query.redirect_uri}?code=${code}`)
        }
    });
    
    const providers = []
    for (const key in props.providers) {
        providers.push(props.providers[key])
    }

    return (
        <>
            {
                session.data?.user?.id ?
                <button onClick={() => authorize.mutate(router.query as any)}>Authorize</button>
                : (() => {
                    const providers = []
                    for (const key in props.providers) {
                        const provider = props.providers[key]
                        providers.push((<button key={key} onClick={() => signIn(provider?.id)}>Login with {provider?.name}</button>))
                    }
                    return providers;
                })()
            }
        </>
    );
};

export default Authorize;
