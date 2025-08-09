import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import Layout from "@/containers/Layout";
import Dashboard from "@/partials/Dashboard";

import { NextPage } from "next";

const Home: NextPage = ({
}) => {
  return (
    <Layout isScreenHeight={false} isFullWidth={false} isHeaderFullWidth={false}>
      <Dashboard></Dashboard>
    </Layout>
  );
}

export default Home;