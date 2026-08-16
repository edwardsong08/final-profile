import Image from 'next/image';

import styles from './ProjectEvidence.module.css';

type EvidenceProps = {
  priority?: boolean;
};

export function TroaEvidence({ priority = false }: EvidenceProps) {
  const scope = [
    ['Products', 'Public · Careers · Tickets · LMS'],
    ['Operations', 'Admin · Reporting · Compliance'],
    ['Infrastructure', 'Hosting · Networks · Game servers'],
    ['Teams', 'Development · UI/UX · Network · IT Ops'],
  ] as const;

  return (
    <figure className={`${styles.artifact} ${styles.troaArtifact}`}>
      <div className={styles.artifactHeader}>
        <span>TROA technology scope</span>
        <strong>Active</strong>
      </div>
      <div className={styles.screenshotViewport}>
        <Image
          src="/case-studies/troa-home.png"
          alt="TROA public platform home page"
          fill
          priority={priority}
          sizes="(max-width: 960px) 100vw, 52vw"
          className={styles.screenshot}
        />
      </div>
      <figcaption className={styles.scopeIndex}>
        {scope.map(([label, value]) => (
          <span key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function ClaimChainEvidence() {
  const roles = [
    ['Provider', 'Submit claim + documents'],
    ['Administrator', 'Review + score + package'],
    ['Buyer', 'Purchase + entitled export'],
  ] as const;

  return (
    <figure className={`${styles.artifact} ${styles.claimArtifact}`}>
      <div className={styles.artifactHeader}>
        <span>ClaimChain workflow</span>
        <strong>Test-data prototype</strong>
      </div>
      <div className={styles.roleFlow}>
        {roles.map(([role, action], index) => (
          <div className={styles.roleNode} key={role}>
            <small>0{index + 1}</small>
            <strong>{role}</strong>
            <span>{action}</span>
          </div>
        ))}
      </div>
      <figcaption className={styles.authorityBand}>
        <div>
          <small>Backend authority</small>
          <strong>Eligibility · lifecycle · payment · export access</strong>
        </div>
        <p>ML may suggest packages. It cannot approve claims or grant access.</p>
      </figcaption>
    </figure>
  );
}

export function RyuEvidence({ priority = false }: EvidenceProps) {
  const stages = ['Services', 'NJ / NY scope', 'Validated request', 'Server email'];

  return (
    <figure className={`${styles.artifact} ${styles.ryuArtifact}`}>
      <div className={styles.artifactHeader}>
        <span>Ryu Legal production path</span>
        <strong>Live</strong>
      </div>
      <div className={styles.screenshotViewport}>
        <Image
          src="/case-studies/ryu-home.png"
          alt="Ryu Legal production website home page"
          fill
          priority={priority}
          sizes="(max-width: 960px) 100vw, 52vw"
          className={styles.screenshot}
        />
      </div>
      <figcaption className={styles.deliveryFlow} aria-label="Services to server email delivery">
        {stages.map((stage, index) => (
          <span key={stage}>
            <small>0{index + 1}</small>
            <strong>{stage}</strong>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function ProjectEvidence({
  project,
  priority = false,
}: EvidenceProps & { project: 'troa' | 'claimchain' | 'ryu-legal' }) {
  if (project === 'troa') return <TroaEvidence priority={priority} />;
  if (project === 'claimchain') return <ClaimChainEvidence />;
  return <RyuEvidence priority={priority} />;
}
