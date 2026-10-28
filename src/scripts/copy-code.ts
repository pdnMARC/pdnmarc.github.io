// "Copy" buttons for the code blocks in the documentation guides (DocsLayout). Folder trees
// (```text) are left alone. Added by script, so without JavaScript the blocks are simply shown.
const blocks = document.querySelectorAll<HTMLPreElement>(".docs__body pre[data-language]:not([data-language='text'])");

async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Older browsers / insecure contexts: copy through a temporary selection.
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.append(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    }
}

blocks.forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "code-copy";
    pre.before(wrap);
    wrap.append(pre);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy__btn";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V6h2v14h11v2zm4-6V4z"/></svg><span>Copy</span>';
    const label = button.querySelector("span")!;
    const status = document.createElement("span");
    status.className = "sr-only";
    status.setAttribute("role", "status");

    let timer: number | undefined;
    button.addEventListener("click", async () => {
        const ok = await copyText(pre.querySelector("code")?.textContent ?? pre.textContent ?? "");
        label.textContent = ok ? "Copied" : "Copy failed";
        status.textContent = ok ? "Code copied to clipboard" : "Could not copy the code";
        button.classList.toggle("is-done", ok);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            label.textContent = "Copy";
            status.textContent = "";
            button.classList.remove("is-done");
        }, 2000);
    });
    wrap.append(button, status);
});
