import { type NextPage } from "next";
import { useRouter } from "next/router";

const StatusPage: NextPage = () => {
    const router = useRouter();
    const username = router.query.userId as string;
    return (
        <>{username}</>
    )
}
export default StatusPage;