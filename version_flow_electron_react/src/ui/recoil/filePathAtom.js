import { atom } from "recoil";

export const filePathState = atom({
    key: "filePathState",
    default: "", // Default file path (empty initially)
});
