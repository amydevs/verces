import type { GetServerSideProps, NextPage } from "next";
import generateProvider from "server/oauth";
import type Provider from "oidc-provider";
import { useRouter } from "next/router";

interface InteractionPageProps {
    details: Awaited<ReturnType<typeof Provider.prototype.interactionDetails>>
}

export const getServerSideProps: GetServerSideProps<InteractionPageProps> = async (context) => {
    const { req, res } = context;
    const provider = await generateProvider();
    
    const details = await provider.interactionDetails(req, res);

    if (req.method === "POST") {
        switch (details.prompt.name) {

        }
        res.end("help");
    }

    return {
        props: {
            details: JSON.parse(JSON.stringify(details))
        }
    };
};

const InteractionPage: NextPage<InteractionPageProps> = (props) => {
    const router = useRouter();
    const { uid } = router.query;

    return (
        <form action={`/interaction/${uid}/login`} method="post">
            <input type="text" name="login" />
            <input type="text" name="password" />
            <button type="submit">Submit</button>
        </form>
    );
};

export default InteractionPage;