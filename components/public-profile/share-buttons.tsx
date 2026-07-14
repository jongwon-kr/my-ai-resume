"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { resolveKakaoShareImageUrl } from "@/lib/kakao/validate-image-url";
import {
  getOpenGraphImageUrl,
  getPublicProfileUrl,
  getShareSnippet,
} from "@/lib/site/url";
import { ReportButton } from "./report-button";

interface ShareButtonsProps {
  profileId: string;
  slug: string;
  name: string;
  roleTitle: string | null;
  intro: string | null;
}

const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

export function ShareButtons({
  profileId,
  slug,
  name,
  roleTitle,
  intro,
}: ShareButtonsProps) {
  const [kakaoReady, setKakaoReady] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const profileUrl = getPublicProfileUrl(slug);
  const ogImageUrl = resolveKakaoShareImageUrl(getOpenGraphImageUrl(slug));
  const shareTitle = roleTitle ? `${name} · ${roleTitle}` : name;
  const shareDescription =
    intro ?? `${name}님의 AI 이력서 클론 프로필을 확인해 보세요.`;

  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!kakaoKey) {
      return;
    }

    if (window.Kakao?.isInitialized()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKakaoReady(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${KAKAO_SDK_URL}"]`,
    );

    function initKakao() {
      if (!window.Kakao || window.Kakao.isInitialized()) {
        setKakaoReady(Boolean(window.Kakao?.isInitialized()));
        return;
      }

      window.Kakao.init(kakaoKey!);
      setKakaoReady(true);
    }

    if (existingScript) {
      existingScript.addEventListener("load", initKakao);
      initKakao();
      return () => existingScript.removeEventListener("load", initKakao);
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = initKakao;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        getShareSnippet(slug),
      );
      setCopyMessage("복사되었습니다.");
    } catch {
      setCopyMessage("복사에 실패했습니다.");
    }

    window.setTimeout(() => setCopyMessage(null), 1500);
  }

  function shareKakao() {
    if (!window.Kakao?.isInitialized()) {
      setCopyMessage("카카오 SDK를 불러오는 중입니다.");
      return;
    }

    const imageUrl = ogImageUrl;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `${name}님의 AI 이력서`,
        description: shareDescription,
        ...(imageUrl ? { imageUrl } : {}),
        link: {
          mobileWebUrl: profileUrl,
          webUrl: profileUrl,
        },
      },
      buttons: [
        {
          title: "프로필 보기",
          link: {
            mobileWebUrl: profileUrl,
            webUrl: profileUrl,
          },
        },
      ],
    });
  }

  function shareX() {
    const text = encodeURIComponent(`${shareTitle} | CloneCV`);
    const url = encodeURIComponent(profileUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {process.env.NEXT_PUBLIC_KAKAO_JS_KEY ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!kakaoReady}
            onClick={shareKakao}
            aria-label="카카오톡으로 공유"
          >
            카카오톡
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={shareX}
          aria-label="X에 공유"
        >
          X 공유
        </Button>

        
        <div className="relative inline-flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyLink}
            aria-label="프로필 링크 복사"
          >
            링크 복사
          </Button>
          {copyMessage ? (
            <p
              className="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs text-center shadow z-10 border fade-in"
              role="status"
            >
              {copyMessage}
            </p>
          ) : null}
        </div>
        
        <ReportButton profileId={profileId} />
      </div>
    </div>
  );
}
