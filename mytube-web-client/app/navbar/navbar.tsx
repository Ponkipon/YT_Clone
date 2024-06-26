'use client';

import Image from "next/image"
import Link from "next/link";

import SignIn from "./sign-in-out";
import styles from "./navbar.module.css"
import { onAuthStateChangedHelper } from "../utilities/Firebase/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { unsubscribe } from "diagnostics_channel";
import Upload from "./upload";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        //clean up subscription on unmount
        return () => unsubscribe();
    });

    return ( 
        <nav className={styles.nav}>
            <Link href="/">
                <span className={styles.logoContainer}>
                    <Image width={90} height={30}
                    src="/showoff-logo.svg" alt="LOGO"/>
                </span>
            </Link>
            {
                <Upload />
            }
            <SignIn user={user} />
        </nav>
    );
}