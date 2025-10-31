import type { Metadata } from "next";

import SalonPublicClient from "./SalonPublicClient";
import type { SalonPublicDetail } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "https://d-swipe.com";

async function fetchSalonPublic(salonId: string): Promise<SalonPublicDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/salons/${salonId}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SalonPublicDetail;
  } catch (error) {
    console.error("Failed to load public salon detail", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ salonId: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const salonId = resolvedParams?.salonId;
  const salon = typeof salonId === "string" ? await fetchSalonPublic(salonId) : null;

  if (!salon) {
    return {
      title: "サロン | D-swipe",
      description: "D-swipeのオンラインサロンプラットフォーム",
      openGraph: {
        title: "サロン | D-swipe",
        description: "D-swipeのオンラインサロンプラットフォーム",
        url: `${SITE_ORIGIN}/salons/${salonId ?? ""}/public`,
        siteName: "D-swipe",
      },
      twitter: {
        card: "summary",
        title: "サロン | D-swipe",
        description: "D-swipeのオンラインサロンプラットフォーム",
      },
    };
  }

  const title = `${salon.title} | D-swipe サロン`;
  const description = salon.description || "オンラインサロンで専門的なコンテンツを学びましょう";
  const thumbnail = salon.thumbnail_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}/salons/${salon.id}/public`,
      siteName: "D-swipe",
      images: thumbnail ? [{ url: thumbnail }] : undefined,
    },
    twitter: {
      card: thumbnail ? "summary_large_image" : "summary",
      title,
      description,
      images: thumbnail ? [thumbnail] : undefined,
    },
  };
}

export default async function SalonPublicPage({ params }: { params: Promise<{ salonId: string }> }) {
  const resolvedParams = await params;
  const salonIdParam = resolvedParams?.salonId;
  const salonId = typeof salonIdParam === "string" ? salonIdParam : "";

  const initialSalon = salonId ? await fetchSalonPublic(salonId) : null;

  return <SalonPublicClient salonId={salonId} initialSalon={initialSalon} />;
}
