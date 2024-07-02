'use-client';

import { Fragment } from "react";
import Image from "next/image"
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
                <Image src={`${user.photoURL}`} onClick={signOut} className={styles.SignedIn} width={45} height={45} alt="Sign Out"></Image>
            ) : (
                <button className={styles.button} onClick={signInWithGoogle}>
                    <span className={styles.iconContainer}>
                        <svg className={styles.icon} fill="none" viewBox="-13 1 65 30" xmlns="http://www.w3.org/2000/svg">
                        <path id="Path_8" data-name="Path 8" d="M25.428,13.307h0a10,10,0,1,0-18.856,0h0A11.986,11.986,0,0,0,0,24v6a2,2,0,0,0,2,2H30a2,2,0,0,0,2-2V24A11.986,11.986,0,0,0,25.428,13.307ZM16,4a6,6,0,1,1-6,6A6.007,6.007,0,0,1,16,4ZM28,28H4V24A8,8,0,0,1,8.637,16.75a9.966,9.966,0,0,0,14.726,0A8,8,0,0,1,28,24Z" fill="#6a8ef6"></path>                        </svg>
                    </span>
                    <span className={styles.text}>Sign In</span>
                </button>
            )
            }
        </Fragment>
    )

}