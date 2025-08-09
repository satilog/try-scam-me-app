import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
// import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import Layout from "@/containers/Layout";

import { useAppContext } from "@/context/AppContext";
import SignIn from "@/partials/SignIn";

const Home: NextPage = (
  {
  }
) => {
  return (
    <Layout isScreenHeight={false}>
      <SignIn></SignIn>
    </Layout>
  );
};

export default Home;
