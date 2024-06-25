'use-client';

import { Fragment } from "react";

import { signInWithGoogle, signOut } from "../utilities/Firebase/firebase";
import styles from './sign-in.module.css';
import { User } from "firebase/auth";

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {


    return (
        <Fragment>
            { user ?
            (
                <button className={styles.SignIn} onClick={signOut}>
                    Sign Out
                </button>
            ) : (
                <button className={styles.SignIn} onClick={signInWithGoogle}>
                    Sign In
                </button>
            )
            }
        </Fragment>
    )

}