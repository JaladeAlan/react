import React from "react";
import  Button from "../../components/Button";
import  Input  from "../../components/Input";

export default function Checkout() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
      <div className="space-y-4">
        <Input label="Amount" type="number" placeholder="Enter amount" />
        <Input label="Payment Method" placeholder="Bank Transfer / Card" />
        <Button className="w-full">Confirm Investment</Button>
      </div>
    </div>
  );
}
