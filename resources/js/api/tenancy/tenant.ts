import axios from "axios";
import { route } from "ziggy-js";

/** Ganti sekolah aktif untuk sesi user terdoklog-in. */
export const switchActiveSchool = (schoolId: number) =>
    axios.post(route("tenant.current.store"), { school_id: schoolId });
