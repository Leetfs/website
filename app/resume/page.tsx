import type { Metadata } from "next";
import StudioFooter from "../_studio/components/studio-footer";
import StudioHeader from "../_studio/components/studio-header";
import StudioPrintButton from "../_studio/components/studio-print-button";
import styles from "../_studio/content.module.css";

export const metadata: Metadata = {
  title: "个人简介 — Lee",
  description: "Lee 的个人简介、技术方向、项目经历和参与的开源社区。",
};

const skills = [
  ["LANGUAGES", "C / C++ / TypeScript / Python"],
  ["SYSTEMS", "Linux / RISC-V / systemd / glibc"],
  ["COMPILER", "LLVM / CodeGen / CMake"],
  ["WEB", "React / Vue / Electron"],
  ["INFRA", "Jenkins / GitHub Actions / Docker / Nginx"],
];

const experience = [
  {
    period: "2026.03 — NOW",
    role: "openRuyi Linux 发行版开发",
    organization: "中国科学院软件研究所",
    points: [
      "完成 Amazon SageMaker SDK 在 RISC-V 生态的重构与适配，处理复杂的 Namespace 冲突。",
      "追踪上游 CVE，通过补丁回移、编译与回归测试完成 RISC-V 环境下的安全修复。",
      "参与发行版创新工具的设计与维护，为基础设施引入自动化与 AI 能力。",
    ],
  },
  {
    period: "2025.05 — 2025.07",
    role: "乘影 GPGPU LLVM 工具链开发",
    organization: "中国科学院软件研究所",
    points: [
      "参与面向 RISC-V 自定义指令扩展的开源工具链建设。",
      "为 LLVM 工具链补充向量 half 类型支持。",
      "解决 CodeGen 阶段的指令兼容性与代码生成正确性问题。",
    ],
  },
  {
    period: "2025.02 — 2025.05",
    role: "RISC-V 自动化测试与性能分析平台",
    organization: "中国科学院软件研究所",
    points: [
      "建设基于 Jenkins 的 RISC-V 自动化测试和性能分析流程。",
      "实现多版本性能对比与 HTML 报告生成。",
      "持续追踪 OpenCV 在 RVV 场景中的 PR 与 commit 性能变化。",
    ],
  },
];

const communities = [
  ["openRuyi", "Contributor · Linux / Packaging / Security", "https://github.com/openRuyi"],
  ["Project Trans", "成员 · 前端 / CI / Bot / Review", "https://github.com/project-trans"],
  ["开往 Travellings", "成员 · Bot / 前端 / 文档", "https://github.com/travellings-link/travellings"],
];

export default function ResumePage() {
  return (
    <main className={`${styles.page} ${styles.innerPage} ${styles.resumePage}`}>
      <StudioHeader compact />
      <header className={styles.resumeHero}>
        <div>
          <p className={styles.index}>PROFILE / 2026</p>
          <h1>Lee<span>.</span></h1>
          <p>LINUX / RISC-V / LLVM / WEB</p>
        </div>
        <aside>
          <p>
            你好，我是 Lee，计算机科学与技术专业本科在读。目前在中国科学院软件研究所参与
            openRuyi Linux 开发，也会写前端、维护 CI，偶尔折腾 VRChat。
          </p>
          <div>
            <a href="mailto:lee@mtftm.com" target="_blank" rel="noopener noreferrer">lee@mtftm.com ↗</a>
            <a href="https://github.com/Leetfs" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
          <StudioPrintButton />
        </aside>
      </header>

      <div className={styles.resumeBody} id="resume-content">
        <section className={styles.resumeSection}>
          <div className={styles.resumeSectionTitle}>
            <span>01</span><h2>会用的东西</h2><p>SKILLS</p>
          </div>
          <div className={styles.skillList}>
            {skills.map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection}>
          <div className={styles.resumeSectionTitle}>
            <span>02</span><h2>做过的项目</h2><p>EXPERIENCE</p>
          </div>
          <div className={styles.resumeTimeline}>
            {experience.map((item, index) => (
              <article key={item.role}>
                <span>0{index + 1}</span>
                <div>
                  <p><time>{item.period}</time><span>{item.organization}</span></p>
                  <h3>{item.role}</h3>
                  <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection}>
          <div className={styles.resumeSectionTitle}>
            <span>03</span><h2>开源社区</h2><p>COMMUNITY</p>
          </div>
          <div className={styles.resumeLinks}>
            {communities.map(([name, role, href], index) => (
              <a href={href} target="_blank" rel="noopener noreferrer" key={name}>
                <span>0{index + 1}</span><h3>{name}</h3><p>{role}</p><b>↗</b>
              </a>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection}>
          <div className={styles.resumeSectionTitle}>
            <span>04</span><h2>教育背景</h2><p>EDUCATION</p>
          </div>
          <div className={styles.educationBlock}>
            <p>COMPUTER SCIENCE &amp; TECHNOLOGY</p>
            <h3>计算机科学与技术</h3>
            <span>本科在读</span>
          </div>
        </section>
      </div>
      <StudioFooter />
    </main>
  );
}
