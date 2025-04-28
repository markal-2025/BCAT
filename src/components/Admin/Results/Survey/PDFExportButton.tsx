import { useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { UsersResultsResponse } from "./SurveyResults";
import { Organization } from "../../../../contexts/Auth";

const PDFExportButton = ({
  compositeResult,
  roleTarget,
  userResults,
  chartRefs,
  anonymousMode, // Add anonymousMode prop
  organization,
  traitWordings, // Add this prop
}: {
  compositeResult: any;
  roleTarget: any;
  userResults: any;
  chartRefs: any;
  anonymousMode: boolean; // Add this prop to control if users are anonymous in PDF
  organization: Organization;
  traitWordings: any[]; // Add this type
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    setIsGenerating(true);

    try {
      await generatePDFReport({
        compositeResult,
        roleTarget,
        userResults,
        chartRefs,
        anonymousMode,
        organization,
        traitWordings, // Pass trait wordings to the PDF generator
      });

      // Show success message
      alert("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Show error message
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      disabled={isGenerating}
      className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {isGenerating ? (
        <>
          <svg
            className="w-5 h-5 mr-2 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export PDF Report {anonymousMode ? "(Anonymous Mode)" : ""}
        </>
      )}
    </button>
  );
};

/**
 * Generate a PDF report of all survey results
 * @param {Object} data - Object containing all the survey data
 * @param {Object} data.compositeResult - The team's composite result
 * @param {Object} data.roleTarget - The role target result
 * @param {Array} data.userResults - Individual user results
 * @param {Object} data.chartRefs - References to chart DOM elements
 * @param {boolean} data.anonymousMode - Whether to anonymize user names
 */
const generatePDFReport = async (data: any) => {
  const {
    compositeResult,
    roleTarget,
    userResults,
    chartRefs,
    anonymousMode,
    organization,
    traitWordings,
  } = data;

  // Function to generate anonymous names (same as in the React component)
  const getAnonymousName = (index: number) => {
    return `Team Member ${index + 1}`;
  };

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set some initial variables
    let yPosition = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();
    // Add organization logo if available
    if (organization?.logo) {
      try {
        // Create a canvas to manipulate the image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = organization.logo;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Create a canvas to process the image
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Fill with white background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the image on top
          ctx.drawImage(img, 0, 0);

          try {
            // Invert colors if needed (for white logos)
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = imageData.data;

            // Check if the image is predominantly white
            let whitePixels = 0;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
                whitePixels++;
              }
            }

            // If more than 70% of pixels are white, invert the colors
            if (whitePixels > (data.length / 4) * 0.7) {
              for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
              }
              ctx.putImageData(imageData, 0, 0);
            }
          } catch (error) {
            console.warn("Could not process image colors:", error);
          }

          // Calculate logo dimensions (max width 40mm, maintain aspect ratio)
          const maxLogoWidth = 40;
          const logoAspectRatio = img.width / img.height;
          const logoWidth = Math.min(maxLogoWidth, 40);
          const logoHeight = logoWidth / logoAspectRatio;

          // Center the logo horizontally
          const logoX = (pageWidth - logoWidth) / 2;

          // Convert to JPEG with reduced quality
          const logoData = canvas.toDataURL("image/jpeg", 0.8);

          // Add processed logo to PDF
          pdf.addImage(
            logoData,
            "JPEG",
            logoX,
            yPosition,
            logoWidth,
            logoHeight
          );

          // Update yPosition to account for logo
          yPosition += logoHeight + 10;
        }
      } catch (error) {
        console.error("Error adding logo to PDF:", error);
        // If CORS or canvas manipulation fails, try adding the image directly
        try {
          const img = new Image();
          img.src = organization.logo;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const maxLogoWidth = 40;
          const logoAspectRatio = img.width / img.height;
          const logoWidth = Math.min(maxLogoWidth, 40);
          const logoHeight = logoWidth / logoAspectRatio;
          const logoX = (pageWidth - logoWidth) / 2;

          // Convert to JPEG with reduced quality
          const logoData = img.src.replace(
            "data:image/png",
            "data:image/jpeg;quality=0.8"
          );

          pdf.addImage(
            logoData,
            "JPEG",
            logoX,
            yPosition,
            logoWidth,
            logoHeight
          );

          yPosition += logoHeight + 10;
        } catch (fallbackError) {
          console.error("Fallback logo addition failed:", fallbackError);
        }
      }
    }

    // Find this section in the generatePDFReport function and replace it with the code below:
    // Find this section in the generatePDFReport function and replace it with the code below:

    // Add title and header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Team Assessment Report`, pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 8;
    pdf.setFontSize(14);
    pdf.text(
      `${compositeResult.team.organization.name} - ${compositeResult.team.name}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const dateString = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Add indicator if anonymous mode is active
    const reportStatusText = anonymousMode
      ? `Report generated on ${dateString} (Anonymous Mode)`
      : `Report generated on ${dateString}`;

    pdf.text(reportStatusText, pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 15;

    // Add organization and sponsor information box
    pdf.setDrawColor(229, 231, 235); // Light gray border
    pdf.setFillColor(249, 250, 251); // Light gray background (gray-50)
    pdf.roundedRect(pageWidth / 2 - 70, yPosition, 140, 50, 3, 3, "FD");

    yPosition += 8;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Organization Information", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // Display organization info
    const orgInfoX = pageWidth / 2 - 60;
    pdf.text(
      `Organization: ${compositeResult.team.organization.name}`,
      orgInfoX,
      yPosition
    );
    yPosition += 7;
    pdf.text(`Team: ${compositeResult.team.name}`, orgInfoX, yPosition);
    yPosition += 7;

    // Add sponsor info from organization object
    if (organization) {
      // Format sponsor name with first and last name
      const sponsorName = `${organization.sponsorFirstName || ""} ${
        organization.sponsorLastName || ""
      }`.trim();
      pdf.text(`Sponsor: ${sponsorName}`, orgInfoX, yPosition);
      yPosition += 7;
      pdf.text(
        `Sponsor Email: ${organization.sponsorEmail || ""}`,
        orgInfoX,
        yPosition
      );
    }

    yPosition += 15; // Add extra spacing after the box
    // REPLACE THE TRAIT SUMMARY WITH THE NEW TEXT
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    // Function to add a single full-width chart to the PDF
    async function addChartToPdf(
      chartRef: any,
      caption: string,
      currentY: number
    ): Promise<number> {
      if (!chartRef) {
        console.warn(`Chart ref is null or undefined for: ${caption}`);
        return currentY;
      }

      try {
        // Capture the chart element as a canvas with reduced scale and quality
        const canvas = await html2canvas(chartRef, {
          scale: 1.5, // Reduced from 2 to 1.5
          logging: false,
          useCORS: true,
          windowHeight: chartRef.scrollHeight,
          height: chartRef.scrollHeight,
          imageTimeout: 0, // Disable image timeout
          backgroundColor: "#FFFFFF", // Ensure white background
          onclone: (clonedElement) => {
            // Optimize cloned element
            const images = clonedElement.getElementsByTagName("img");
            for (let i = 0; i < images.length; i++) {
              images[i].style.maxWidth = "100%";
              images[i].style.height = "auto";
            }
          },
        });

        // Convert to JPEG with reduced quality
        const imgData = canvas.toDataURL("image/jpeg", 0.8); // Using JPEG with 80% quality

        const imgWidth = pageWidth - 30;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + imgHeight + 15 > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          currentY = 15;
        }

        // Add the image to PDF
        pdf.addImage(imgData, "JPEG", 15, currentY, imgWidth, imgHeight);

        // Add caption
        currentY += imgHeight + 5;
        pdf.setFontSize(9);
        pdf.text(caption, pageWidth / 2, currentY, { align: "center" });

        return currentY + 15;
      } catch (error) {
        console.error(`Error capturing chart (${caption}):`, error);
        return currentY;
      }
    }

    // Capture and add charts to the PDF
    try {
      // START NEW PAGE FOR BAR CHARTS
      pdf.addPage();
      yPosition = 15;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Team Alignment Analysis", 14, yPosition);
      yPosition += 10;

      // Add Consonance chart
      if (chartRefs.consonanceChartRef?.current) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Step One. Consonance", 14, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        const stepOneText = [
          " Are we all singing from the same sheet of music?",
        ];

        // First paragraph
        const maxWidth = pageWidth - 40; // 20mm margins on each side
        const wrappedText1 = pdf.splitTextToSize(stepOneText[0], maxWidth);
        pdf.text(wrappedText1, 20, yPosition);
        yPosition += wrappedText1.length * 6; // Adjust position based on number of lines

        yPosition += 4; // Add some spacing

        yPosition = await addChartToPdf(
          chartRefs.consonanceChartRef.current,
          "Consonance Chart",
          yPosition
        );
      }

      // Only show Steps Two and Three if resonance exists
      if (compositeResult.resonance) {
        // Add Resonance chart with Step Two text
        if (chartRefs.resonanceChartRef?.current) {
          // Check if we need a new page
          if (yPosition + 100 > pdf.internal.pageSize.getHeight()) {
            pdf.addPage();
            yPosition = 15;
          }

          // Add Step Two heading with styling
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Step Two. Resonance", 14, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          const stepTwoText = [
            "Are we singing songs that our audience/customers paid to hear?",
          ];

          // First paragraph with styling
          const maxWidth = pageWidth - 40;
          const wrappedText1 = pdf.splitTextToSize(stepTwoText[0], maxWidth);
          pdf.text(wrappedText1, 20, yPosition);
          yPosition += wrappedText1.length * 6;

          yPosition += 4;

          // Now add the resonance chart
          yPosition = await addChartToPdf(
            chartRefs.resonanceChartRef.current,
            "Resonance Chart",
            yPosition
          );
        }

        // Add Consonance and Resonance chart
        if (chartRefs.consonanceResonanceChartRef?.current) {
          // Check if we need a new page
          if (yPosition + 100 > pdf.internal.pageSize.getHeight()) {
            pdf.addPage();
            yPosition = 15;
          }

          // Add Step Three heading with styling
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text("Step Three. Brand and Culture Alignment", 14, yPosition);
          yPosition += 8;

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          // Now add the combined chart
          yPosition = await addChartToPdf(
            chartRefs.consonanceResonanceChartRef.current,
            "Consonance and Resonance Chart",
            yPosition
          );
        }
      }

      // Add Traits Bar chart first
      if (chartRefs.traitsBarChartRef?.current) {
        try {
          // Start a new page for the traits bar chart
          pdf.addPage();
          yPosition = 15;

          // Temporarily increase the height of the chart container
          const chartElement = chartRefs.traitsBarChartRef.current;
          const originalHeight = chartElement.style.height;

          // Set auto height to ensure all content is visible
          chartElement.style.height = "auto";
          chartElement.style.minHeight = "800px";

          // Use reduced scale factor and optimize image quality
          const canvas = await html2canvas(chartElement, {
            scale: 1.5, // Reduced from 2 to 1.5
            logging: false,
            useCORS: true,
            windowHeight: chartElement.scrollHeight,
            height: chartElement.scrollHeight,
            backgroundColor: "#FFFFFF",
            onclone: (clonedElement) => {
              const indicators = clonedElement.querySelectorAll(
                ".flex.items-center.gap-2"
              );
              indicators.forEach((indicator) => {
                if (indicator instanceof HTMLElement) {
                  indicator.style.display = "flex";
                  indicator.style.marginBottom = "10px";
                  indicator.style.width = "100%";
                }
              });
            },
          });

          // Restore original height
          chartElement.style.height = originalHeight;

          // Convert to JPEG with reduced quality
          const imgData = canvas.toDataURL("image/jpeg", 0.8);

          const imgWidth = pageWidth - 30;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Add the image to PDF
          pdf.addImage(imgData, "JPEG", 15, yPosition, imgWidth, imgHeight);

          // Add caption
          yPosition += imgHeight + 5;
          pdf.setFontSize(9);
          pdf.text("Team Traits Comparison Chart", pageWidth / 2, yPosition, {
            align: "center",
          });

          yPosition += 15;
        } catch (error) {
          console.error("Error capturing Traits Bar chart:", error);
        }
      }

      // Add Team Values section on a new page
      pdf.addPage();
      yPosition = 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Consonance values", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 15;

      // Modified function to place Team Values and Organization Target Values side by side
      const addTraitWordingsSideBySide = (yPos: number) => {
        // Function to get trait wordings by rank (same as in SurveyResults component)
        const getTraitWordingsByRank = (result: any, traitWordings: any[]) => {
          // Create a map of trait names to their ranks
          const traitRanks = {
            Precision: result.precisionRank,
            Resolve: result.resolveRank,
            Harmony: result.harmonyRank,
            Innovation: result.innovationRank,
          };

          // Sort traits by their rank
          const sortedTraits = Object.entries(traitRanks).sort(
            ([, rankA], [, rankB]) => (rankA as number) - (rankB as number)
          );

          // Get wordings for each trait based on their rank
          return sortedTraits.map(([traitName, rank]) => {
            const traitWording = traitWordings.find(
              (wording) =>
                wording.traitName === traitName &&
                wording.traitWordingRank === rank
            );
            return {
              traitName,
              rank,
              wording: traitWording?.traitWording || "",
            };
          });
        };

        // Define trait colors (same as in SurveyResults)
        const TRAIT_COLORS = {
          Precision: "#008e9e",
          Resolve: "#ed3e44",
          Harmony: "#72a854",
          Innovation: "#e8cf9b",
        };

        // Get ordered trait wordings
        const orderedTeamWordings = getTraitWordingsByRank(
          compositeResult,
          traitWordings || []
        );

        // Get ordered role target wordings if available
        const hasRoleTarget =
          roleTarget &&
          roleTarget.precisionRank &&
          roleTarget.resolveRank &&
          roleTarget.harmonyRank &&
          roleTarget.innovationRank;

        const orderedRoleTargetWordings = hasRoleTarget
          ? getTraitWordingsByRank(roleTarget, traitWordings || [])
          : [];

        // Calculate column widths for side-by-side layout
        const columnWidth = (pageWidth - 45) / 2; // 15mm left margin, 15mm right margin, 15mm between columns

        // Draw section titles
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Team Values", 15, yPos);

        if (hasRoleTarget) {
          pdf.text("Resonance Values", 15 + columnWidth + 15, yPos);
        }

        yPos += 8;

        // Draw background boxes with darker background
        pdf.setFillColor(248, 248, 248); // Brighter gray background
        pdf.setDrawColor(220, 220, 220); // Slightly darker border color

        // Calculate heights based on content
        const teamBoxHeight = orderedTeamWordings.length * 25 + 60;
        const targetBoxHeight = hasRoleTarget
          ? orderedRoleTargetWordings.length * 25 + 60
          : 0;
        const maxBoxHeight = Math.max(teamBoxHeight, targetBoxHeight);

        // Draw team values box
        pdf.roundedRect(15, yPos, columnWidth, maxBoxHeight, 3, 3, "FD");

        // Draw target values box if available
        if (hasRoleTarget) {
          pdf.roundedRect(
            15 + columnWidth + 15,
            yPos,
            columnWidth,
            maxBoxHeight,
            3,
            3,
            "FD"
          );
        }

        // Starting positions for text
        let teamYPos = yPos + 10;
        let targetYPos = yPos + 10;

        // Add team trait wordings
        orderedTeamWordings.forEach((trait) => {
          // Convert hex color to RGB
          const hexColor =
            TRAIT_COLORS[trait.traitName as keyof typeof TRAIT_COLORS];
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);

          // Use brighter yellow for innovation in team values
          if (trait.traitName === "Innovation") {
            pdf.setTextColor(234, 179, 8); // Using a bright yellow
          } else {
            pdf.setTextColor(r, g, b);
          }
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          // Split long text into multiple lines
          const textLines = pdf.splitTextToSize(
            trait.wording,
            columnWidth - 10
          );
          pdf.text(textLines, 20, teamYPos);
          teamYPos += textLines.length * 6 + 9; // Add spacing between traits
        });

        // Add role target trait wordings if available
        if (hasRoleTarget) {
          orderedRoleTargetWordings.forEach((trait) => {
            // Convert hex color to RGB
            const hexColor =
              TRAIT_COLORS[trait.traitName as keyof typeof TRAIT_COLORS];
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);

            // Use brighter yellow for innovation in resonance values
            if (trait.traitName === "Innovation") {
              pdf.setTextColor(234, 179, 8); // Using a bright yellow
            } else {
              pdf.setTextColor(r, g, b);
            }
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");

            // Split long text into multiple lines
            const textLines = pdf.splitTextToSize(
              trait.wording,
              columnWidth - 10
            );
            pdf.text(textLines, 20 + columnWidth + 15, targetYPos);
            targetYPos += textLines.length * 6 + 9; // Add spacing between traits
          });
        }

        // Reset text color
        pdf.setTextColor(0, 0, 0);

        return yPos + maxBoxHeight + 10;
      };

      // Use the new side-by-side layout function
      yPosition = addTraitWordingsSideBySide(yPosition);
    } catch (error) {
      console.error("Error capturing charts:", error);
    }

    // Add new page for individual results
    pdf.addPage();
    yPosition = 15;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Individual Team Member Results", pageWidth / 2, yPosition, {
      align: "center",
    });

    yPosition += 15;

    // Add styled table of user results
    const addUserResultsTable = (
      userResults: UsersResultsResponse,
      startY: number
    ) => {
      // Define colors similar to those in the React component
      const colors = {
        headerBg: [248, 248, 248] as [number, number, number],
        rowHover: [249, 250, 251] as [number, number, number],
        border: [229, 231, 235] as [number, number, number], // gray-200 equivalent
        precision: [8, 145, 178] as [number, number, number], // cyan-600 equivalent
        resolve: [239, 68, 68] as [number, number, number], // red-500 equivalent
        harmony: [22, 163, 74] as [number, number, number], // green-600 equivalent
        innovation: [234, 179, 8] as [number, number, number], // yellow-500 equivalent
        black: [0, 0, 0] as [number, number, number],
        gray: [107, 114, 128] as [number, number, number], // gray-500 equivalent
      };

      // Calculate column widths for the table
      const tableWidth = pageWidth - 30; // 15mm margins on each side
      const colWidths = [32, 26, 26, 26, 26, 26]; // Width for each column in mm
      const rowHeight = 12; // Height in mm
      const headerHeight = 15; // Header height in mm

      // Table positioning
      const tableX = 15; // X position of the table
      let currentY = startY;

      // Draw table border
      pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      pdf.rect(
        tableX,
        currentY,
        tableWidth,
        headerHeight + rowHeight * userResults.length
      );

      // Draw table header
      pdf.setFillColor(
        colors.headerBg[0],
        colors.headerBg[1],
        colors.headerBg[2]
      );
      pdf.rect(tableX, currentY, tableWidth, headerHeight, "F");

      // Draw header text
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

      let xPos = tableX;
      pdf.text("Team Member", xPos + 4, currentY + 6);
      xPos += colWidths[0];

      // Precision header with color
      pdf.setTextColor(
        colors.precision[0],
        colors.precision[1],
        colors.precision[2]
      );
      pdf.text("Precision", xPos + 4, currentY + 6);
      pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      pdf.setFontSize(7);
      pdf.text("Rank | Score", xPos + 4, currentY + 11);
      pdf.setFontSize(9);
      xPos += colWidths[1];

      // Resolve header with color
      pdf.setTextColor(colors.resolve[0], colors.resolve[1], colors.resolve[2]);
      pdf.text("Resolve", xPos + 4, currentY + 6);
      pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      pdf.setFontSize(7);
      pdf.text("Rank | Score", xPos + 4, currentY + 11);
      pdf.setFontSize(9);
      xPos += colWidths[2];

      // Harmony header with color
      pdf.setTextColor(colors.harmony[0], colors.harmony[1], colors.harmony[2]);
      pdf.text("Harmony", xPos + 4, currentY + 6);
      pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      pdf.setFontSize(7);
      pdf.text("Rank | Score", xPos + 4, currentY + 11);
      pdf.setFontSize(9);
      xPos += colWidths[3];

      // Innovation header with color
      pdf.setTextColor(234, 179, 8); // Using a bright yellow
      pdf.text("Innovation", xPos + 4, currentY + 6);
      pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
      pdf.setFontSize(7);
      pdf.text("Rank | Score", xPos + 4, currentY + 11);
      pdf.setFontSize(9);
      xPos += colWidths[4];

      // Primary Trait header
      pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      pdf.text("Primary Trait", xPos + 4, currentY + 6);

      // Move to the first row
      currentY += headerHeight;

      // Draw table rows
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

      userResults.forEach((user, index) => {
        // Check if we need a new page
        if (currentY + rowHeight > pdf.internal.pageSize.getHeight() - 15) {
          pdf.addPage();
          currentY = 15;

          // Draw table border for new page
          pdf.setDrawColor(
            colors.border[0],
            colors.border[1],
            colors.border[2]
          );
          const remainingRows = userResults.length - index;
          pdf.rect(
            tableX,
            currentY,
            tableWidth,
            headerHeight + rowHeight * remainingRows
          );

          // Redraw header on new page
          pdf.setFillColor(
            colors.headerBg[0],
            colors.headerBg[1],
            colors.headerBg[2]
          );
          pdf.rect(tableX, currentY, tableWidth, headerHeight, "F");

          // Redraw header text
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");

          xPos = tableX;
          pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
          pdf.text("Team Member", xPos + 4, currentY + 6);
          xPos += colWidths[0];

          pdf.setTextColor(
            colors.precision[0],
            colors.precision[1],
            colors.precision[2]
          );
          pdf.text("Precision", xPos + 4, currentY + 6);
          pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
          pdf.setFontSize(7);
          pdf.text("Rank | Score", xPos + 4, currentY + 11);
          pdf.setFontSize(9);
          xPos += colWidths[1];

          pdf.setTextColor(
            colors.resolve[0],
            colors.resolve[1],
            colors.resolve[2]
          );
          pdf.text("Resolve", xPos + 4, currentY + 6);
          pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
          pdf.setFontSize(7);
          pdf.text("Rank | Score", xPos + 4, currentY + 11);
          pdf.setFontSize(9);
          xPos += colWidths[2];

          pdf.setTextColor(
            colors.harmony[0],
            colors.harmony[1],
            colors.harmony[2]
          );
          pdf.text("Harmony", xPos + 4, currentY + 6);
          pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
          pdf.setFontSize(7);
          pdf.text("Rank | Score", xPos + 4, currentY + 11);
          pdf.setFontSize(9);
          xPos += colWidths[3];

          pdf.setTextColor(
            colors.innovation[0],
            colors.innovation[1],
            colors.innovation[2]
          );
          pdf.text("Innovation", xPos + 4, currentY + 6);
          pdf.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
          pdf.setFontSize(7);
          pdf.text("Rank | Score", xPos + 4, currentY + 11);
          pdf.setFontSize(9);
          xPos += colWidths[4];

          pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
          pdf.text("Primary Trait", xPos + 4, currentY + 6);

          currentY += headerHeight;
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
        }

        // Add background color for alternating rows
        if (index % 2 === 1) {
          pdf.setFillColor(
            colors.rowHover[0],
            colors.rowHover[1],
            colors.rowHover[2]
          );
          pdf.rect(tableX, currentY, tableWidth, rowHeight, "F");
        }

        // Draw bottom border for each row
        pdf.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
        pdf.line(
          tableX,
          currentY + rowHeight,
          tableX + tableWidth,
          currentY + rowHeight
        );

        // Determine the primary trait based on rankings
        const traits = [
          {
            name: "Precision",
            rank: user.precisionRank,
            color: colors.precision,
            lightColor: [224, 242, 254] as [number, number, number], // cyan-100 equivalent
          },
          {
            name: "Resolve",
            rank: user.resolveRank,
            color: colors.resolve,
            lightColor: [254, 226, 226] as [number, number, number], // red-100 equivalent
          },
          {
            name: "Harmony",
            rank: user.harmonyRank,
            color: colors.harmony,
            lightColor: [220, 252, 231] as [number, number, number], // green-100 equivalent
          },
          {
            name: "Innovation",
            rank: user.innovationRank,
            color: colors.innovation,
            lightColor: [254, 249, 195] as [number, number, number], // yellow-100 equivalent
          },
        ];

        // Find the primary trait (rank 1)
        const primaryTrait =
          traits.find((trait) => trait.rank === 1) || traits[0];

        // Draw row data
        xPos = tableX;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "medium");

        // Use anonymous name if anonymousMode is true
        const displayName = anonymousMode
          ? getAnonymousName(index)
          : user.user.username;

        pdf.text(displayName, xPos + 4, currentY + rowHeight / 2 + 1);
        pdf.setFont("helvetica", "normal");
        xPos += colWidths[0];

        // Format scores with 1 decimal place
        const precisionScore = user.precisionAdjScore;
        const resolveScore = user.resolveAdjScore;
        const harmonyScore = user.harmonyAdjScore;
        const innovationScore = user.innovationAdjScore;

        pdf.text(
          `${user.precisionRank} | ${precisionScore}%`,
          xPos + 4,
          currentY + rowHeight / 2 + 1
        );
        xPos += colWidths[1];

        pdf.text(
          `${user.resolveRank} | ${resolveScore}%`,
          xPos + 4,
          currentY + rowHeight / 2 + 1
        );
        xPos += colWidths[2];

        pdf.text(
          `${user.harmonyRank} | ${harmonyScore}%`,
          xPos + 4,
          currentY + rowHeight / 2 + 1
        );
        xPos += colWidths[3];

        pdf.text(
          `${user.innovationRank} | ${innovationScore}%`,
          xPos + 4,
          currentY + rowHeight / 2 + 1
        );
        xPos += colWidths[4];

        // Add a colored badge for primary trait
        const badgeWidth = 25;
        const badgeHeight = 6;
        const badgeX = xPos + 4;
        const badgeY = currentY + (rowHeight - badgeHeight) / 2;

        // Draw badge background with light color
        pdf.setFillColor(
          primaryTrait.lightColor[0],
          primaryTrait.lightColor[1],
          primaryTrait.lightColor[2]
        );
        pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, "F");

        // Draw trait name with matching color
        if (primaryTrait.name === "Innovation") {
          pdf.setTextColor(234, 179, 8); // Using a bright yellow
        } else {
          pdf.setTextColor(
            primaryTrait.color[0],
            primaryTrait.color[1],
            primaryTrait.color[2]
          );
        }
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          primaryTrait.name,
          badgeX + badgeWidth / 2,
          badgeY + badgeHeight / 2 + 1,
          {
            align: "center",
          }
        );

        // Reset text color
        pdf.setTextColor(colors.black[0], colors.black[1], colors.black[2]);

        // Move to next row
        currentY += rowHeight;
      });

      // Reset all styles
      pdf.setDrawColor(0);
      pdf.setTextColor(0);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      return currentY + 10;
    };

    yPosition = addUserResultsTable(userResults, yPosition);

    // Add footer with page numbers
    const totalPages = (pdf.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 3,
        { align: "center" }
      );
    }

    // Save the PDF
    const pdfName = anonymousMode
      ? `${compositeResult.team.name}_Assessment_Report_Anonymous.pdf`
      : `${compositeResult.team.name}_Assessment_Report.pdf`;
    pdf.save(pdfName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

export default PDFExportButton;
