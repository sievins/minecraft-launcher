import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({});
const INSTANCE_ID = process.env.INSTANCE_ID!;

export async function describe() {
  const out = await ec2.send(
    new DescribeInstancesCommand({ InstanceIds: [INSTANCE_ID] }),
  );
  return out.Reservations?.[0]?.Instances?.[0];
}

export async function startInstance() {
  await ec2.send(new StartInstancesCommand({ InstanceIds: [INSTANCE_ID] }));
  await waitUntilInstanceRunning(
    { client: ec2, maxWaitTime: 180 }, // seconds
    { InstanceIds: [INSTANCE_ID] },
  );
  return describe();
}

export async function stopInstance() {
  await ec2.send(new StopInstancesCommand({ InstanceIds: [INSTANCE_ID] }));
  return describe();
}
