import { withSpan } from "@roomly/common";
import bcrypt from "bcrypt";

export class PasswordUtils {
    static async hash(password: string): Promise<string> {
        return await withSpan(
            'bcrypt.hash',
            () => bcrypt.hash(password, 10),
            { work: 'cpu' },
          );
    }

    static async compare(password: string, hash: string): Promise<boolean> {
        return await withSpan(
            'bcrypt.compare',
            () => bcrypt.compare(password, hash),
            { work: 'cpu' },
          );
    }
}