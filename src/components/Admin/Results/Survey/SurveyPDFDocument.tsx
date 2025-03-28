// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,
//   Image,
// } from "@react-pdf/renderer";
// import { CompositeResult } from "./SurveyResults";

// Font.register({
//   family: "Roboto",
//   src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
// });

// const styles = StyleSheet.create({
//   page: {
//     flexDirection: "column",
//     backgroundColor: "#ffffff",
//     padding: 30,
//   },
//   section: {
//     margin: 10,
//     padding: 10,
//     border: "1 solid #e5e7eb",
//     borderRadius: 4,
//   },
//   header: {
//     fontSize: 24,
//     marginBottom: 20,
//     fontFamily: "Roboto",
//   },
//   title: {
//     fontSize: 18,
//     marginBottom: 10,
//     color: "#111827",
//   },
//   subtitle: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginBottom: 15,
//   },
//   chartGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   chartContainer: {
//     width: "45%",
//     marginBottom: 20,
//   },
//   chart: {
//     width: "100%",
//     height: 200,
//     objectFit: "contain",
//   },
//   comparisonChart: {
//     width: "100%",
//     height: 300,
//     marginVertical: 20,
//   },
//   traitSection: {
//     marginTop: 15,
//     paddingTop: 15,
//     borderTop: "1 solid #e5e7eb",
//   },
// });

// interface SurveyPDFDocumentProps {
//   compositeResult: CompositeResult;
//   roleTarget: CompositeResult;
//   chartImages: any; // Changed from 'charts' to 'chartImages' for consistency
// }

// const SurveyPDFDocument = ({
//   compositeResult,
//   roleTarget,
//   chartImages,
// }: SurveyPDFDocumentProps) => (
//   <Document>
//     <Page size="A4" style={styles.page}>
//       <Text style={styles.header}>
//         {compositeResult.team.organization.name} - {compositeResult.team.name}
//       </Text>

//       <View style={styles.section}>
//         <Text style={styles.title}>Overview Scores</Text>
//         <View style={styles.chartGrid}>
//           <View style={styles.chartContainer}>
//             <Text style={styles.subtitle}>Precision (Experts)</Text>
//             {chartImages.precision && (
//               <Image src={chartImages.precision} style={styles.chart} />
//             )}
//           </View>
//           <View style={styles.chartContainer}>
//             <Text style={styles.subtitle}>Resolve (Drivers)</Text>
//             {chartImages.resolve && (
//               <Image src={chartImages.resolve} style={styles.chart} />
//             )}
//           </View>
//           <View style={styles.chartContainer}>
//             <Text style={styles.subtitle}>Harmony (Caretakers)</Text>
//             {chartImages.harmony && (
//               <Image src={chartImages.harmony} style={styles.chart} />
//             )}
//           </View>
//           <View style={styles.chartContainer}>
//             <Text style={styles.subtitle}>Innovation (Creators)</Text>
//             {chartImages.innovation && (
//               <Image src={chartImages.innovation} style={styles.chart} />
//             )}
//           </View>
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.title}>Consonance and Resonance</Text>
//         {chartImages.comparison && (
//           <Image src={chartImages.comparison} style={styles.comparisonChart} />
//         )}
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.title}>Trait Comparisons</Text>

//         {["Precision", "Resolve", "Harmony", "Innovation"].map(
//           (trait, index) => (
//             <View key={trait} style={styles.traitSection}>
//               <Text style={styles.subtitle}>{trait}</Text>
//               {chartImages[`${trait.toLowerCase()}Comparison`] && (
//                 <Image
//                   src={chartImages[`${trait.toLowerCase()}Comparison`]}
//                   style={styles.chart}
//                 />
//               )}
//             </View>
//           )
//         )}
//       </View>
//     </Page>
//   </Document>
// );

// export default SurveyPDFDocument;
