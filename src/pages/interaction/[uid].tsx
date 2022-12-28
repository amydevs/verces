import type { GetServerSideProps, NextPage } from "next";
import generateProvider from "server/oauth";
import type Provider from "oidc-provider";

interface InteractionPageProps {
    details: Awaited<ReturnType<typeof Provider.prototype.interactionDetails>>
}

export const getServerSideProps: GetServerSideProps<InteractionPageProps> = async (context) => {
    const { req, res } = context;
    const provider = await generateProvider();
    const details = JSON.parse(JSON.stringify(await provider.interactionDetails(req, res)));
    return {
        props: {
            details
        }
    };
};

const InteractionPage: NextPage<InteractionPageProps> = (props) => {
    console.log(props);
    return (
        <form>

        </form>
    );
};

export default InteractionPage;