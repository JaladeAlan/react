import React from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function Withdraw() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Withdraw Funds</h2>
      <div className="space-y-4">
        <Input label="Amount" type="number" placeholder="Enter amount to withdraw" />
        <Input label="Bank Account" placeholder="Account number" />
        <Button className="w-full">Withdraw</Button>
      </div>
    </div>
  );
}
