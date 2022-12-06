import { IFollow } from "./type";
import { getApObjectBody } from "./utils";

export const fromFollow = async(follow: IFollow | string) => {
    const gotFollow = (await getApObjectBody(follow)) as IFollow;
    console.log(gotFollow);
};