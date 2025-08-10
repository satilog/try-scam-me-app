import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import Layout from "@/containers/Layout";
import SafeList from "@/partials/SafeList";

import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <Layout isScreenHeight={true} isFullWidth={false} isHeaderFullWidth={false}>
      <SafeList />
    </Layout>
  );
};


export default Home;