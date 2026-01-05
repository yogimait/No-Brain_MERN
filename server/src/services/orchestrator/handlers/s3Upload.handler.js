export default async function s3UploadHandler(nodeConfig, inputs, context) {
  console.log(`[s3Upload] Executing node ${nodeConfig.id}`);

  // Minimal mock -- in real app this would put object to S3
  return {
    success: true,
    type: 's3Upload',
    nodeId: nodeConfig.id,
    result: { message: 'S3 upload simulated', details: nodeConfig.data }
  };
}
