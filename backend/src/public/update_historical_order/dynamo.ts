import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export class Dynamo {
  client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({ region: "us-east-1" });
  }

  async updateOrderData(
    email: string,
    created_at: string,
    po: string,
    est_ship_date: string
  ) {
    const update_command = new UpdateItemCommand({
      Key: {
        email: { S: email },
        created_at: { S: created_at },
      },
      UpdateExpression: "set po = :po, est_ship_date = :est_ship_date",
      ExpressionAttributeValues: {
        ":po": {
          S: po,
        },
        ":est_ship_date": {
          S: est_ship_date,
        },
      },
      TableName: "archived_orders",
    });

    await this.client.send(update_command);
  }
}