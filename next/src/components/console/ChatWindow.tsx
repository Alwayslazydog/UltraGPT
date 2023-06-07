import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { FaPause, FaPlay } from "react-icons/fa";
import PopIn from "../motions/popin";
import FadeIn from "../motions/FadeIn";
import {
  AUTOMATIC_MODE,
  getTaskStatus,
  MESSAGE_TYPE_SYSTEM,
  PAUSE_MODE,
  TASK_STATUS_EXECUTING,
} from "../../types/agentTypes";
import clsx from "clsx";
import { useAgentStore } from "../../stores";
import { Switch } from "../Switch";
import { ChatMessage } from "./ChatMessage";
import type { HeaderProps } from "./MacWindowHeader";
import { MacWindowHeader, messageListId } from "./MacWindowHeader";
import { ExampleAgentButton } from "./ExampleAgentButton";

interface ChatWindowProps extends HeaderProps {
  children?: ReactNode;
  className?: string;
  fullscreen?: boolean;
  scrollToBottom?: boolean;
  displaySettings?: boolean; // Controls if settings are displayed at the bottom of the ChatWindow
  setAgentRun?: (name: string, goal: string) => void;
  visibleOnMobile?: boolean;
}

const ChatWindow = ({
  messages,
  children,
  className,
  title,
  onSave,
  fullscreen,
  scrollToBottom,
  displaySettings,
  setAgentRun,
  visibleOnMobile,
}: ChatWindowProps) => {
  const [t] = useTranslation();
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isAgentPaused = useAgentStore.use.isAgentPaused();
  const agentMode = useAgentStore.use.agentMode();
  const agent = useAgentStore.use.agent();
  const updateAgentMode = useAgentStore.use.updateAgentMode();

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;

    // Use has scrolled if we have scrolled up at all from the bottom
    const hasUserScrolled = scrollTop < scrollHeight - clientHeight - 10;
    setHasUserScrolled(hasUserScrolled);
  };

  useEffect(() => {
    // Scroll to bottom on re-renders
    if (scrollToBottom && scrollRef && scrollRef.current) {
      if (!hasUserScrolled) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  });

  const handleUpdateAgentMode = (value: boolean) => {
    updateAgentMode(value ? PAUSE_MODE : AUTOMATIC_MODE);
  };

  return (
    <div
      className={clsx(
        "border-translucent w-full flex-col rounded-2xl border-2 border-white/20 bg-zinc-900 text-white shadow-2xl drop-shadow-lg xl:flex",
        className,
        visibleOnMobile ? "flex" : "hidden"
      )}
    >
      <MacWindowHeader title={title} messages={messages} onSave={onSave} />
      <div
        className={clsx(
          "mb-2 mr-2 ",
          (fullscreen && "max-h-[75vh] flex-grow overflow-auto") || "window-heights"
        )}
        ref={scrollRef}
        onScroll={handleScroll}
        id={messageListId}
      >
        {agent !== null && agentMode === PAUSE_MODE && isAgentPaused && (
          <FaPause className="animation-hide absolute left-1/2 top-1/2 text-lg md:text-3xl" />
        )}
        {agent !== null && agentMode === PAUSE_MODE && !isAgentPaused && (
          <FaPlay className="animation-hide absolute left-1/2 top-1/2 text-lg md:text-3xl" />
        )}
        {messages.map((message, index) => {
          if (getTaskStatus(message) === TASK_STATUS_EXECUTING) {
            return null;
          }

          return (
            <FadeIn key={`${index}-${message.type}`}>
              <ChatMessage message={message} />
            </FadeIn>
          );
        })}
        {children}

        {messages.length === 0 && (
          <>
            <PopIn delay={0.8}>
              <ChatMessage
                message={{
                  type: MESSAGE_TYPE_SYSTEM,
                  value: "👉 " + t("CREATE_AN_AGENT_DESCRIPTION", { ns: "chat" }),
                }}
              />
            </PopIn>
            <PopIn delay={1.5}>
              <div className="m-2 flex flex-col justify-between gap-2 sm:m-4 sm:flex-row">
                <ExampleAgentButton name="代码 🎮" setAgentRun={setAgentRun}>
                   帮我写一份游戏代码
                </ExampleAgentButton>
                <ExampleAgentButton name="旅游 🌴" setAgentRun={setAgentRun}>
                   帮我写一份去台湾旅游的攻略
                </ExampleAgentButton>
                <ExampleAgentButton name="研报 📜" setAgentRun={setAgentRun}>
                   帮我写一份详细的有关贵州茅台的研究报告
                </ExampleAgentButton>
          
              </div>
              <div className="m-2 flex flex-col justify-between gap-2 sm:m-4 sm:flex-row">
              <ExampleAgentButton name="爬虫 😈" setAgentRun={setAgentRun}>
                   告诉我知乎今天的热门话题
                </ExampleAgentButton>
                <ExampleAgentButton name="科技 " setAgentRun={setAgentRun}>
                   帮我搜索有关苹果最新MR眼镜的信息
                </ExampleAgentButton>
                <ExampleAgentButton name="教育 📏" setAgentRun={setAgentRun}>
                   我需要了解什么是拉格朗日定理
                </ExampleAgentButton>
                </div>
                <div className="m-2 flex flex-col justify-between gap-2 sm:m-4 sm:flex-row">
                <ExampleAgentButton name="经济 🚗" setAgentRun={setAgentRun}>
                  帮我分析一下中国2023年CPI和就业率
                </ExampleAgentButton> 
                <ExampleAgentButton name="文化 📚" setAgentRun={setAgentRun}>
                  古希腊文化的起源是什么
                </ExampleAgentButton> 
                <ExampleAgentButton name="新闻 📢" setAgentRun={setAgentRun}>
                  整理下最近科技行业的新闻
                </ExampleAgentButton>  
                </div>
            </PopIn>
          </>
        )}
      </div>
      {displaySettings && (
        <div className="flex flex-row items-center justify-center">
          <SwitchContainer label={PAUSE_MODE}>
            <Switch
              disabled={agent !== null}
              value={agentMode === PAUSE_MODE}
              onChange={handleUpdateAgentMode}
            />
          </SwitchContainer>
        </div>
      )}
    </div>
  );
};

const SwitchContainer = ({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className="m-1 flex w-36 items-center justify-center gap-2 rounded-lg border-2 border-white/20 bg-zinc-700 px-2 py-1">
      <p className="font-mono text-sm">{label}</p>
      {children}
    </div>
  );
};

export default ChatWindow;
