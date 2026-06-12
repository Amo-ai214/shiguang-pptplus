(function () {
  const studioEmail = "2715904052@qq.com";
  const studioWechat = "15307003711";
  const selectedStyles = new Set();

  const styleButtons = Array.from(document.querySelectorAll(".style-card"));
  const selectedStylesText = document.getElementById("selectedStylesText");
  const selectedStylesInput = document.getElementById("selectedStylesInput");
  const requestForm = document.getElementById("requestForm");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const summaryList = document.getElementById("summaryList");
  const formStatus = document.getElementById("formStatus");
  const mailButton = document.getElementById("mailButton");
  const copyWechat = document.getElementById("copyWechat");
  const mobileCopyWechat = document.getElementById("mobileCopyWechat");
  const copyStatus = document.getElementById("copyStatus");
  const conditionalControls = Array.from(document.querySelectorAll("[data-other-control]"));
  const sectionToggles = Array.from(document.querySelectorAll(".section-toggle"));

  let latestPackageName = "";

  function getFormData() {
    const formData = new FormData(requestForm);
    const deliverables = formData.getAll("deliverables");
    const deliverablesOther = clean(formData.get("deliverablesOther"));
    return {
      projectName: clean(formData.get("projectName")),
      contact: clean(formData.get("contact")),
      wechat: clean(formData.get("wechat")),
      email: clean(formData.get("email")),
      contactTime: clean(formData.get("contactTime")),
      purpose: clean(formData.get("purpose")),
      purposeOther: clean(formData.get("purposeOther")),
      materialStatus: clean(formData.get("materialStatus")),
      materialStatusOther: clean(formData.get("materialStatusOther")),
      serviceType: clean(formData.get("serviceType")),
      serviceTypeOther: clean(formData.get("serviceTypeOther")),
      pageCount: clean(formData.get("pageCount")),
      deadline: clean(formData.get("deadline")),
      urgency: clean(formData.get("urgency")),
      contentOptimization: clean(formData.get("contentOptimization")),
      lockedContent: clean(formData.get("lockedContent")),
      keyContent: clean(formData.get("keyContent")),
      extraRequirements: clean(formData.get("extraRequirements")),
      selectedStyles: Array.from(selectedStyles),
      referenceLinks: clean(formData.get("referenceLinks")),
      dislikedStyle: clean(formData.get("dislikedStyle")),
      brandRequirements: clean(formData.get("brandRequirements")),
      deliverables,
      deliverablesOther,
      revisionConfirm: formData.get("revisionConfirm") === "on",
      files: Array.from(fileInput.files || [])
    };
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function safeFileName(value) {
    return clean(value)
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 60) || "PPT需求";
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function withOther(value, otherValue) {
    if (value === "其他" && otherValue) return `其他：${otherValue}`;
    return value;
  }

  function getDeliverablesText(data) {
    if (!data.deliverables.length) return "";
    return data.deliverables
      .map((item) => (item === "其他" && data.deliverablesOther ? `其他：${data.deliverablesOther}` : item))
      .join("、");
  }

  function updateSelectedStyles() {
    const styles = Array.from(selectedStyles);
    const text = styles.length ? styles.join("、") : "暂未选择，可直接提交需求。";
    selectedStylesText.textContent = text;
    selectedStylesInput.value = styles.length ? styles.join("、") : "暂未选择";
    updateSummary();
  }

  function renderFiles() {
    const files = Array.from(fileInput.files || []);
    fileList.innerHTML = "";

    if (!files.length) {
      updateSummary();
      return;
    }

    files.forEach((file) => {
      const item = document.createElement("li");
      const name = document.createElement("span");
      const size = document.createElement("span");
      name.textContent = file.name;
      size.textContent = formatFileSize(file.size);
      item.append(name, size);
      fileList.appendChild(item);
    });

    updateSummary();
  }

  function setSummaryItem(term, description) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = description || "待填写";
    wrapper.append(dt, dd);
    return wrapper;
  }

  function updateSummary() {
    const data = getFormData();
    const fileText = data.files.length
      ? `${data.files.length} 个文件，约 ${formatFileSize(data.files.reduce((sum, file) => sum + file.size, 0))}`
      : "暂未上传";
    const styleText = data.selectedStyles.length ? data.selectedStyles.join("、") : "暂未选择";

    summaryList.innerHTML = "";
    summaryList.append(
      setSummaryItem("项目", data.projectName || "待填写"),
      setSummaryItem("用途", withOther(data.purpose, data.purposeOther) || "待选择"),
      setSummaryItem("服务", withOther(data.serviceType, data.serviceTypeOther) || "待选择"),
      setSummaryItem("截止", data.deadline ? data.deadline.replace("T", " ") : "待填写"),
      setSummaryItem("风格", styleText),
      setSummaryItem("资料", fileText)
    );
  }

  function buildRequirementMarkdown(data) {
    const fileLines = data.files.length
      ? data.files.map((file) => `- ${file.name}（${formatFileSize(file.size)}）`).join("\n")
      : "- 暂未上传文件";

    return `# 拾光工作室 PPT 制作需求

## 基础信息
- 项目名称 / 项目称呼：${data.projectName || "未填写"}
- 联系方式：${data.contact || "未填写"}
- 微信号：${data.wechat || "未填写"}
- 邮箱：${data.email || "未填写"}
- 希望联系时间：${data.contactTime || "未填写"}

## PPT 信息
- PPT 用途：${withOther(data.purpose, data.purposeOther) || "未选择"}
- 当前资料状态：${withOther(data.materialStatus, data.materialStatusOther) || "未选择"}
- 服务需求：${withOther(data.serviceType, data.serviceTypeOther) || "未选择"}
- 预计页数：${data.pageCount || "未填写"}
- 截止时间：${data.deadline ? data.deadline.replace("T", " ") : "未填写"}
- 是否加急：${data.urgency || "未选择"}

## 内容处理
- 是否需要内容优化：${data.contentOptimization || "未选择"}
- 哪些内容不能改：${data.lockedContent || "未填写"}
- 希望重点突出的内容：${data.keyContent || "未填写"}
- 个人具体要求 / 想法：${data.extraRequirements || "未填写"}

## 风格相关
- 已选参考风格：${data.selectedStyles.length ? data.selectedStyles.join("、") : "未选择"}
- 参考链接：${data.referenceLinks || "未填写"}
- 不喜欢的风格：${data.dislikedStyle || "未填写"}
- 学校、公司、比赛、品牌色要求：${data.brandRequirements || "未填写"}

## 交付相关
- 需要的交付格式：${getDeliverablesText(data) || "未选择"}
- 修改范围确认：${data.revisionConfirm ? "已确认" : "未确认"}

## 上传文件清单
${fileLines}

## 隐私说明
此需求包由客户浏览器本地生成。页面不会把资料上传到公开服务器。
`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildMailto(data) {
    const subject = `PPT制作需求-${data.projectName || "待报价项目"}-${data.wechat || data.contact || "客户"}`;
    const body = [
      "你好，我已在拾光工作室网站生成 PPT 需求包。",
      "",
      `项目名称：${data.projectName || "未填写"}`,
      `PPT 用途：${withOther(data.purpose, data.purposeOther) || "未选择"}`,
      `服务需求：${withOther(data.serviceType, data.serviceTypeOther) || "未选择"}`,
      `预计页数：${data.pageCount || "未填写"}`,
      `截止时间：${data.deadline ? data.deadline.replace("T", " ") : "未填写"}`,
      `微信号：${data.wechat || "未填写"}`,
      "",
      latestPackageName
        ? `我会把需求包 ${latestPackageName} 作为附件添加到这封邮件中。`
        : "我会把需求包作为附件添加到这封邮件中。",
      "",
      "请根据资料帮我评估报价和制作时间。"
    ].join("\n");

    return `mailto:${studioEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.classList.remove("success", "error");
    if (type) formStatus.classList.add(type);
  }

  function updateConditionalField(control) {
    const target = document.getElementById(control.dataset.otherControl);
    if (!target) return;

    const shouldShow = control.type === "checkbox" ? control.checked : control.value === "其他";
    const input = target.querySelector("input, textarea, select");
    target.hidden = !shouldShow;
    if (input) {
      input.required = shouldShow;
      if (!shouldShow) input.value = "";
    }
  }

  function setSectionExpanded(button, expanded) {
    const target = document.getElementById(button.dataset.toggleTarget);
    if (!target) return;

    target.classList.toggle("is-collapsed", !expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? button.dataset.openLabel : button.dataset.closedLabel;
  }

  function initializeMobileCollapsibles() {
    const shouldCollapse = window.matchMedia("(max-width: 680px)").matches;
    sectionToggles.forEach((button) => {
      setSectionExpanded(button, !shouldCollapse);
    });
  }

  async function createZipPackage(event) {
    event.preventDefault();

    if (!requestForm.reportValidity()) {
      setStatus("请先补全必填信息，再生成需求包。", "error");
      return;
    }

    if (!window.JSZip) {
      setStatus("ZIP 组件还没有加载完成，请稍等几秒后再试。", "error");
      return;
    }

    const data = getFormData();
    const zip = new window.JSZip();
    const requirementText = buildRequirementMarkdown(data);
    const packageName = `${safeFileName(data.projectName)}_拾光工作室PPT需求包.zip`;

    zip.file("需求说明.md", requirementText);
    zip.file("需求数据.json", JSON.stringify({ ...data, files: data.files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || "unknown"
    })) }, null, 2));

    const fileFolder = zip.folder("客户上传资料");
    data.files.forEach((file) => {
      fileFolder.file(file.name, file);
    });

    setStatus("正在生成 ZIP 需求包，请稍等。");

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      latestPackageName = packageName;
      downloadBlob(blob, packageName);
      mailButton.href = buildMailto(data);
      mailButton.classList.remove("is-disabled");
      mailButton.setAttribute("aria-disabled", "false");
      setStatus("需求包已生成。请把下载的 ZIP 文件作为附件添加到邮件中。", "success");
    } catch (error) {
      console.error(error);
      setStatus("生成 ZIP 失败，请检查文件是否过大，或刷新页面后重试。", "error");
    }
  }

  async function copyWechatNumber() {
    try {
      await navigator.clipboard.writeText(studioWechat);
      copyStatus.textContent = "微信号已复制，请打开微信添加。";
    } catch (error) {
      const tempInput = document.createElement("input");
      tempInput.value = studioWechat;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      tempInput.remove();
      copyStatus.textContent = "微信号已复制，请打开微信添加。";
    }
  }

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const style = button.dataset.style;
      if (selectedStyles.has(style)) {
        selectedStyles.delete(style);
        button.setAttribute("aria-pressed", "false");
      } else {
        selectedStyles.add(style);
        button.setAttribute("aria-pressed", "true");
      }
      updateSelectedStyles();
    });
  });

  conditionalControls.forEach((control) => {
    control.addEventListener("change", () => {
      updateConditionalField(control);
      updateSummary();
    });
    updateConditionalField(control);
  });

  sectionToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") !== "true";
      setSectionExpanded(button, expanded);
    });
  });

  requestForm.addEventListener("input", updateSummary);
  requestForm.addEventListener("change", updateSummary);
  requestForm.addEventListener("submit", createZipPackage);
  fileInput.addEventListener("change", renderFiles);
  copyWechat.addEventListener("click", copyWechatNumber);
  mobileCopyWechat.addEventListener("click", copyWechatNumber);

  initializeMobileCollapsibles();
  updateSelectedStyles();
  renderFiles();
})();
