"use client";

import { useMemo, useState } from "react";
import { JSX } from "react";

// Defines available policy tabs shown in the policies navigation.
type TabKey = "privacy" | "terms" | "exchange" | "community";

// Defines props for a single tab button controlling active policy content.
interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

// Defines shared shell props used by each policy panel block.
interface PanelShellProps {
  title: string;
  children: React.ReactNode;
  lastUpdated: string;
}

// Renders a policy tab trigger related to selecting active panel content.
function TabButton({ label, isActive, onClick }: TabButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
        isActive
          ? "bg-green-600 text-white"
          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

// Wraps policy content with common title and last-updated footer styling.
function PanelShell({ title, children, lastUpdated }: PanelShellProps): JSX.Element {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-8">
      <h2 className="text-xl md:text-2xl font-extrabold text-green-900 pb-3 border-b border-gray-100">
        {title}
      </h2>

      {children}

      <p className="mt-10 pt-5 border-t border-gray-100 text-center text-xs text-gray-400 italic">
        Last Updated: {lastUpdated}
      </p>
    </section>
  );
}

// Highlights important policy notes tied to user safety and expectations.
function Callout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="mt-6 bg-green-50 border-l-4 border-green-600 rounded-xl p-4">
      <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
    </div>
  );
}

// Renders standardized subsection headings within each policy panel.
function PolicyH3({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h3 className="mt-8 text-[11px] font-extrabold tracking-wide uppercase text-green-700">
      {children}
    </h3>
  );
}

// Renders standardized paragraph text for policy explanations.
function PolicyP({ children }: { children: React.ReactNode }): JSX.Element {
  return <p className="mt-2 text-sm text-gray-600 leading-relaxed">{children}</p>;
}

// Renders consistent bullet lists used across policy subsections.
function PolicyList({ items }: { items: React.ReactNode[] }): JSX.Element {
  return (
    <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm text-gray-600">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

// Displays privacy rules related to data collection, use, and user rights.
function PrivacyPanel({ lastUpdated }: { lastUpdated: string }): JSX.Element {
  return (
    <PanelShell title="Privacy Policy" lastUpdated={lastUpdated}>
      <PolicyP>
        At Community Skills Exchange, we are committed to protecting your privacy and ensuring
        the security of your personal information. This Privacy Policy explains how we collect,
        use, and safeguard your data.
      </PolicyP>

      <PolicyH3>1. Information We Collect</PolicyH3>
      <PolicyP>We collect the following types of information:</PolicyP>
      <PolicyList items={[
        <><strong>Account Information:</strong> Full name, email address, and location when you register</>,
        <><strong>Profile Information:</strong> Skills you offer, skills you want to learn, and profile descriptions</>,
        <><strong>Communication Data:</strong> Messages exchanged through our platform messaging system</>,
        <><strong>Usage Data:</strong> Information about how you interact with our platform</>,
      ]} />

      <PolicyH3>2. How We Use Your Information</PolicyH3>
      <PolicyP>Your information is used to:</PolicyP>
      <PolicyList items={[
        "Connect you with other community members for skill exchanges",
        "Facilitate communication between users",
        "Improve our platform and user experience",
        "Send important notifications about your account and exchanges",
        "Maintain the safety and security of our community",
      ]} />

      <Callout>
        <strong>Important:</strong> We will never sell your personal information to third parties. Your data is used
        solely to enhance your experience on our platform and facilitate skill exchanges within our community.
      </Callout>

      <PolicyH3>3. Data Security</PolicyH3>
      <PolicyP>
        We implement industry-standard security measures to protect your personal information, including encryption,
        secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure,
        and we cannot guarantee absolute security.
      </PolicyP>

      <PolicyH3>4. Your Rights</PolicyH3>
      <PolicyP>You have the right to:</PolicyP>
      <PolicyList items={[
        "Access your personal data",
        "Correct inaccurate information",
        "Request deletion of your account and data",
        "Opt-out of non-essential communications",
        "Export your data in a portable format",
      ]} />

      <PolicyH3>5. Cookies and Tracking</PolicyH3>
      <PolicyP>
        We use cookies to enhance your browsing experience, remember your preferences, and analyze platform usage.
        You can control cookie settings through your browser preferences.
      </PolicyP>
    </PanelShell>
  );
}

// Displays terms governing account use and platform responsibilities.
function TermsPanel({ lastUpdated }: { lastUpdated: string }): JSX.Element {
  return (
    <PanelShell title="Terms of Service" lastUpdated={lastUpdated}>
      <PolicyP>
        Welcome to Community Skills Exchange. By accessing or using our platform, you agree to be bound by these
        Terms of Service.
      </PolicyP>

      <PolicyH3>1. Acceptance of Terms</PolicyH3>
      <PolicyP>
        By creating an account and using our platform, you acknowledge that you have read, understood, and agree to be
        bound by these terms. If you do not agree with any part of these terms, please do not use our service.
      </PolicyP>

      <PolicyH3>2. User Accounts</PolicyH3>
      <PolicyList items={[
        "You must be at least 18 years old to create an account",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must provide accurate and complete information during registration",
        "You are responsible for all activities that occur under your account",
        "One person or entity may maintain only one account",
      ]} />

      <PolicyH3>3. Skill Exchange System</PolicyH3>
      <PolicyP>Our platform operates on a skill bartering system where:</PolicyP>
      <PolicyList items={[
        "No monetary transactions occur through the platform",
        "Users exchange skills and knowledge based on mutual agreement",
        "Time and effort are the primary currencies of exchange",
        "Both parties must agree to the terms of each exchange",
      ]} />

      <Callout>
        <strong>Note:</strong> Community Skills Exchange is a facilitation platform. We do not guarantee the quality,
        accuracy, or completion of any skill exchange. Users engage with each other at their own discretion.
      </Callout>

      <PolicyH3>4. User Conduct</PolicyH3>
      <PolicyP>You agree not to:</PolicyP>
      <PolicyList items={[
        "Harass, abuse, or harm other users",
        "Post false, misleading, or fraudulent information",
        "Attempt to monetize exchanges outside the spirit of skill bartering",
        "Violate any applicable laws or regulations",
        "Interfere with the proper functioning of the platform",
        "Use the platform for any commercial solicitation",
      ]} />

      <PolicyH3>5. Intellectual Property</PolicyH3>
      <PolicyP>
        The platform and its original content, features, and functionality are owned by Community Skills Exchange and
        are protected by international copyright, trademark, and other intellectual property laws.
      </PolicyP>

      <PolicyH3>6. Termination</PolicyH3>
      <PolicyP>
        We reserve the right to suspend or terminate your account at any time for violations of these terms,
        inappropriate conduct, or at our discretion for the safety and integrity of our community.
      </PolicyP>

      <PolicyH3>7. Limitation of Liability</PolicyH3>
      <PolicyP>
        Community Skills Exchange is not liable for any damages arising from your use of the platform, interactions
        with other users, or any skill exchanges conducted. Users engage with each other at their own risk.
      </PolicyP>
    </PanelShell>
  );
}

// Displays guidelines for how skills exchanges should be arranged and completed.
function ExchangePanel({ lastUpdated }: { lastUpdated: string }): JSX.Element {
  return (
    <PanelShell title="Skills Exchange Policy" lastUpdated={lastUpdated}>
      <PolicyP>
        This policy outlines the guidelines and best practices for successful skill exchanges within our community.
      </PolicyP>

      <PolicyH3>1. Exchange Principles</PolicyH3>
      <PolicyP>Our platform is built on the following principles:</PolicyP>
      <PolicyList items={[
        <><strong>No Money:</strong> All exchanges are based on skill bartering, not monetary payment</>,
        <><strong>Mutual Benefit:</strong> Both parties should gain value from the exchange</>,
        <><strong>Respect:</strong> Treat all community members with courtesy and professionalism</>,
        <><strong>Commitment:</strong> Honor your commitments and show up as agreed</>,
        <><strong>Quality:</strong> Share your skills genuinely and to the best of your ability</>,
      ]} />

      <PolicyH3>2. How Exchanges Work</PolicyH3>
      <PolicyP>The typical exchange process:</PolicyP>
      <PolicyList items={[
        "Browse skills offered by community members",
        "Send a booking request to someone whose skills you want to learn",
        "Communicate through our messaging system to arrange details",
        "Agree on time, location (in-person or virtual), and session duration",
        "Complete the skill exchange session",
        "Leave honest feedback and ratings for each other",
      ]} />

      <Callout>
        <strong>Time Exchange Guidelines:</strong> While there are no strict rules, we recommend that exchanges be
        roughly equivalent in time and effort.
      </Callout>

      <PolicyH3>3. Meeting Options</PolicyH3>
      <PolicyP>Exchanges can take place:</PolicyP>
      <PolicyList items={[
        <><strong>In-Person:</strong> Meet at mutually agreed safe, public locations</>,
        <><strong>Virtual:</strong> Use video conferencing tools for online sessions</>,
        <><strong>Hybrid:</strong> Combine in-person and virtual sessions as needed</>,
      ]} />

      <PolicyH3>4. Safety Guidelines</PolicyH3>
      <PolicyP>For your safety:</PolicyP>
      <PolicyList items={[
        "Always meet new contacts in public places initially",
        "Let someone know where you're going and when you expect to return",
        "Trust your instincts - if something feels wrong, cancel the meeting",
        "Report any suspicious or inappropriate behavior immediately",
        "Keep all communication on the platform until you feel comfortable",
      ]} />

      <PolicyH3>5. Cancellation and No-Shows</PolicyH3>
      <PolicyList items={[
        "Provide at least 24 hours notice if you need to cancel",
        "Reschedule promptly if circumstances require cancellation",
        "Repeated no-shows may result in account suspension",
        "If someone no-shows on you, report it through the platform",
      ]} />

      <PolicyH3>6. Ratings and Reviews</PolicyH3>
      <PolicyP>After each exchange:</PolicyP>
      <PolicyList items={[
        "Leave honest, constructive feedback",
        "Rate the quality of the skill shared and the overall experience",
        "Help future users make informed decisions",
        "Be respectful and professional in your reviews",
      ]} />

      <PolicyH3>7. Dispute Resolution</PolicyH3>
      <PolicyP>If you encounter issues:</PolicyP>
      <PolicyList items={[
        "First, try to resolve the matter directly with the other party",
        "Contact our support team if direct resolution fails",
        "Provide detailed information about the situation",
        "We will investigate and take appropriate action",
      ]} />
    </PanelShell>
  );
}

// Displays behavioral standards for maintaining a safe learning community.
function CommunityPanel({ lastUpdated }: { lastUpdated: string }): JSX.Element {
  return (
    <PanelShell title="Community Guidelines" lastUpdated={lastUpdated}>
      <PolicyP>
        Our community thrives on respect, authenticity, and mutual support. These guidelines help maintain a positive
        environment for all members.
      </PolicyP>

      <PolicyH3>1. Be Respectful and Kind</PolicyH3>
      <PolicyList items={[
        "Treat everyone with courtesy and professionalism",
        "Be patient with learners and appreciate teachers",
        "Respect different skill levels, backgrounds, and learning styles",
        "Communicate clearly and constructively",
      ]} />

      <PolicyH3>2. Be Authentic</PolicyH3>
      <PolicyList items={[
        "Represent your skills honestly and accurately",
        "Don't overstate your expertise or experience",
        "Be upfront about your learning goals and current skill level",
        "Use real photos and genuine information in your profile",
      ]} />

      <PolicyH3>3. Foster a Learning Environment</PolicyH3>
      <PolicyList items={[
        "Be patient and supportive when teaching",
        "Ask questions and be engaged when learning",
        "Provide constructive feedback, not criticism",
        "Celebrate progress and effort, not just results",
      ]} />

      <Callout>
        <strong>Remember:</strong> Everyone was a beginner once. Approach every exchange with empathy, patience, and a
        genuine desire to help others grow.
      </Callout>

      <PolicyH3>4. Communication Standards</PolicyH3>
      <PolicyList items={[
        "Respond to messages within 48 hours when possible",
        "Be clear about your availability and constraints",
        "Confirm meetings 24 hours in advance",
        "Keep the conversation professional and on-topic",
      ]} />

      <PolicyH3>5. Prohibited Behavior</PolicyH3>
      <PolicyP>The following behaviors are strictly prohibited:</PolicyP>
      <PolicyList items={[
        "Harassment, bullying, or discriminatory conduct",
        "Requesting or offering money for exchanges",
        "Sharing inappropriate or offensive content",
        "Spamming or commercial solicitation",
        "Creating fake accounts or impersonating others",
        "Attempting to conduct exchanges off-platform to avoid policies",
      ]} />

      <PolicyH3>6. Profile Best Practices</PolicyH3>
      <PolicyList items={[
        "Use a clear, friendly profile photo",
        "List specific skills you can offer and want to learn",
        "Describe your experience level honestly",
        "Include your availability and preferred exchange format",
        "Keep your profile information current",
      ]} />

      <PolicyH3>7. Contributing to Community Growth</PolicyH3>
      <PolicyList items={[
        "Welcome new members and help them get started",
        "Share your positive experiences to inspire others",
        "Provide feedback to help us improve the platform",
        "Report issues or violations promptly",
        "Be an ambassador for skill sharing in your local area",
      ]} />

      <PolicyH3>8. Reporting Violations</PolicyH3>
      <PolicyP>If you witness behavior that violates these guidelines:</PolicyP>
      <PolicyList items={[
        "Use the report feature on user profiles or messages",
        "Provide specific details about the violation",
        "Include screenshots or evidence if available",
        "Contact our support team at support@communityskillsexchange.com",
      ]} />

      <PolicyH3>9. Consequences</PolicyH3>
      <PolicyP>Violations may result in:</PolicyP>
      <PolicyList items={[
        "Warning and educational guidance",
        "Temporary account suspension",
        "Permanent account termination",
        "Legal action in severe cases",
      ]} />
    </PanelShell>
  );
}

// Renders the policies page and switches policy panels based on active tab.
export default function PoliciesPage(): JSX.Element {
  const [active, setActive] = useState<TabKey>("privacy");
  const lastUpdated = useMemo(() => "February 29, 2026", []);

  return (
    <main className="bg-gray-50 text-gray-800">

      {/* Hero section introducing policy scope for platform users. */}
      <section className="bg-linear-to-br from-green-700 to-green-500 text-white py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Our Policies</h1>
          <p className="mt-3 text-sm md:text-base opacity-90">
            Learn about our community guidelines, privacy practices, and terms of service.
          </p>
        </div>
      </section>

      {/* Main content section containing tab navigation and policy panels. */}
      <div className="max-w-4xl mx-auto px-5 py-10 md:py-14">

        {/* Tab navigation for selecting which policy document to view. */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3 mb-6">
          {(
            [
              { key: "privacy",   label: "Privacy Policy"       },
              { key: "terms",     label: "Terms of Service"      },
              { key: "exchange",  label: "Exchange Policy"       },
              { key: "community", label: "Community Guidelines"  },
            ] as { key: TabKey; label: string }[]
          ).map(({ key, label }) => (
            <TabButton
              key={key}
              label={label}
              isActive={active === key}
              onClick={() => setActive(key)}
            />
          ))}
        </div>

        {/* Conditional panel rendering tied to currently active policy tab. */}
        {active === "privacy"   && <PrivacyPanel   lastUpdated={lastUpdated} />}
        {active === "terms"     && <TermsPanel     lastUpdated={lastUpdated} />}
        {active === "exchange"  && <ExchangePanel  lastUpdated={lastUpdated} />}
        {active === "community" && <CommunityPanel lastUpdated={lastUpdated} />}
      </div>
    </main>
  );
}