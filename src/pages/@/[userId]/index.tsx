import { type GetServerSideProps, type NextPage } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {
            query: context.query
        }
    };
};

const UserPage: NextPage = () => {
    const router = useRouter();
    const usernameAndHost = router.query.userId as string;
    const [username, host] = usernameAndHost.split("@", 1) as [string, string | undefined];
    return (
        <>{username} {host}</>
    );
};
export default UserPage;