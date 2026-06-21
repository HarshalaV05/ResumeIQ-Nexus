let reportText = "";
let extractedResumeText = "";

/* ===========================
PDF Upload
=========================== */

document.getElementById("resumeFile").addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    try {

        const fileReader = new FileReader();

        fileReader.onload = async function () {

            const typedArray = new Uint8Array(this.result);

            const pdf = await pdfjsLib
                .getDocument(typedArray)
                .promise;

            let extractedText = "";

            for (
                let pageNum = 1;
                pageNum <= pdf.numPages;
                pageNum++
            ) {

                const page = await pdf.getPage(pageNum);

                const content =
                    await page.getTextContent();

                const text =
                    content.items
                        .map(item => item.str)
                        .join(" ");

                extractedText += text + "\n";
            }

            extractedResumeText = extractedText;

            document.getElementById("uploadStatus").innerHTML = `
                <div class="upload-icon">✅</div>
                <p>${file.name}</p>
            `;

            console.log(
                "Resume text extracted successfully"
            );
        };

        fileReader.readAsArrayBuffer(file);

    } catch (error) {

        console.error(error);

        alert("Failed to read PDF");
    }
});

/* ===========================
Analyze Resume
=========================== */

async function analyzeResume() {

    const jobDescription =
        document.getElementById("jobDescription").value;

    if (!extractedResumeText) {

        alert("Please upload a resume.");
        return;
    }

    if (!jobDescription.trim()) {

        alert("Please enter a Job Description.");
        return;
    }

    document.getElementById("loading").style.display = "block";

    try {

        const response =
            await fetch("/api/analyze", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    resumeText: extractedResumeText,
                    jobDescription: jobDescription
                })
            });

        const data =
            await response.json();

        console.log(
            "API Response:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI Analysis Failed"
            );
        }

        reportText =
            data.analysis;

        document.getElementById("result").innerHTML = `
            <div class="section ai-box">

                <h2>
                    🤖 AI Resume Analysis
                </h2>

                <pre style="
                    white-space: pre-wrap;
                    line-height: 1.8;
                    font-family: inherit;
                ">
${data.analysis}
                </pre>

            </div>
        `;

    }

    catch (error) {

        console.error(
            "Analysis Error:",
            error
        );

        document.getElementById("result").innerHTML = `
            <div class="section">

                <h3>
                    Error
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;
    }

    document.getElementById("loading").style.display = "none";
}

/* ===========================
Download Report
=========================== */

function downloadReport() {

    if (!reportText) {

        alert(
            "Please analyze a resume first."
        );

        return;
    }

    const { jsPDF } =
        window.jspdf;

    const doc =
        new jsPDF();

    const pageHeight =
        doc.internal.pageSize.height;

    const margin = 15;

    const lineHeight = 8;

    const lines =
        doc.splitTextToSize(
            reportText,
            180
        );

    let y = 20;

    lines.forEach(line => {

        if (
            y >
            pageHeight - margin
        ) {

            doc.addPage();

            y = 20;
        }

        doc.text(
            line,
            10,
            y
        );

        y += lineHeight;
    });

    doc.save(
        "ResumeIQ_Nexus_Report.pdf"
    );
}
