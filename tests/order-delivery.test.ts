/**
 * Automated Tests for FDelivery Order Delivery Workflow
 * 
 * Verifies that the order delivery lifecycle operates smoothly without OTP:
 * 1. Order status transitions through the full delivery lifecycle:
 *    Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered
 * 2. An order can transition directly from "Out for Delivery" to "Delivered" without OTP verification
 * 3. Delivery records the delivery timestamp (delivered_at) and marks payment_status as "paid"
 * 4. Invalid status transitions (e.g. Delivered -> Pending or Completed -> Confirmed) are rejected
 * 5. Order cancellation workflow functions properly (Pending -> Cancelled)
 */

import { db, VALID_ORDER_STATUSES } from '../server/db.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log('🧪 RUNNING ORDER DELIVERY WORKFLOW AUTOMATED TESTS\n');

  // TEST 1: Order Status Validation Constants
  console.log('Test 1: Valid Order Status Definitions');
  assert(VALID_ORDER_STATUSES.includes('Pending'), 'Includes Pending status');
  assert(VALID_ORDER_STATUSES.includes('Confirmed'), 'Includes Confirmed status');
  assert(VALID_ORDER_STATUSES.includes('Preparing'), 'Includes Preparing status');
  assert(VALID_ORDER_STATUSES.includes('Out for Delivery'), 'Includes Out for Delivery status');
  assert(VALID_ORDER_STATUSES.includes('Delivered'), 'Includes Delivered status');
  assert(VALID_ORDER_STATUSES.includes('Cancelled'), 'Includes Cancelled status');

  // TEST 2: Create Order & Transition Through Full Lifecycle
  console.log('\nTest 2: Order Full Lifecycle to Delivery');
  const orderResult = await db.createOrder({
    customer_name: 'Test Customer Delivery',
    customer_email: 'deliverytest@fdelivery.com',
    customer_phone: '+1 555 987 6543',
    delivery_address: '123 Market St',
    city: 'New York',
    zip: '10001',
    delivery_time: 'ASAP',
    items: [
      {
        food_item_id: 'food-1',
        quantity: 2,
      },
    ],
  });

  const order = orderResult.order;
  assert(Boolean(order && order.id), 'Order created successfully');
  assert(order.status === 'Pending', 'Initial order status is Pending');

  // Transition: Pending -> Confirmed
  const confirmResult = await db.updateOrderStatus(order.id, 'Confirmed');
  assert(confirmResult.success === true, 'Transition to Confirmed succeeds');
  assert(confirmResult.order?.status === 'Confirmed', 'Order status is now Confirmed');

  // Transition: Confirmed -> Preparing
  const prepResult = await db.updateOrderStatus(order.id, 'Preparing');
  assert(prepResult.success === true, 'Transition to Preparing succeeds');
  assert(prepResult.order?.status === 'Preparing', 'Order status is now Preparing');

  // Transition: Preparing -> Out for Delivery
  const outResult = await db.updateOrderStatus(order.id, 'Out for Delivery');
  assert(outResult.success === true, 'Transition to Out for Delivery succeeds');
  assert(outResult.order?.status === 'Out for Delivery', 'Order status is now Out for Delivery');

  // TEST 3: Out for Delivery -> Delivered (Direct Transition Without OTP)
  console.log('\nTest 3: Direct Transition to Delivered Without OTP Verification');
  const deliverResult = await db.updateOrderStatus(order.id, 'Delivered');
  assert(deliverResult.success === true, 'Order marked as Delivered directly without OTP');
  assert(deliverResult.order?.status === 'Delivered', 'Order status is now Delivered');
  assert(deliverResult.order?.payment_status === 'paid', 'Payment status updated to paid upon delivery');
  assert(Boolean(deliverResult.order?.delivered_at), 'Delivered timestamp (delivered_at) is set');

  // TEST 4: Invalid Status Transition Rejection
  console.log('\nTest 4: Invalid Status Transitions are Rejected');
  // Attempting to move a Delivered order back to Pending
  const invalidTransition = await db.updateOrderStatus(order.id, 'Pending');
  assert(invalidTransition.success === false, 'Transition from Delivered to Pending is correctly rejected');

  // Attempting to move a Delivered order back to Out for Delivery
  const invalidTransition2 = await db.updateOrderStatus(order.id, 'Out for Delivery');
  assert(invalidTransition2.success === false, 'Transition from Delivered to Out for Delivery is correctly rejected');

  // TEST 5: Order Cancellation Workflow
  console.log('\nTest 5: Order Cancellation Workflow');
  const cancelOrderResult = await db.createOrder({
    customer_name: 'Test Customer Cancel',
    customer_email: 'canceltest@fdelivery.com',
    customer_phone: '+1 555 123 4567',
    delivery_address: '456 Broadway',
    city: 'New York',
    zip: '10002',
    delivery_time: 'ASAP',
    items: [
      {
        food_item_id: 'food-2',
        quantity: 1,
      },
    ],
  });

  const cancelOrder = cancelOrderResult.order;
  assert(cancelOrder.status === 'Pending', 'New order created in Pending status');

  const cancelUpdate = await db.updateOrderStatus(cancelOrder.id, 'Cancelled');
  assert(cancelUpdate.success === true, 'Pending order successfully transitioned to Cancelled');
  assert(cancelUpdate.order?.status === 'Cancelled', 'Order status is Cancelled');

  // Cannot transition cancelled order to Delivered
  const cancelledToDelivered = await db.updateOrderStatus(cancelOrder.id, 'Delivered');
  assert(cancelledToDelivered.success === false, 'Cancelled order cannot be transitioned to Delivered');

  // TEST 6: Admin Orders Retrieval
  console.log('\nTest 6: Admin Orders Retrieval');
  const allOrders = await db.getAllOrders();
  assert(Array.isArray(allOrders) && allOrders.length >= 2, 'Admin can retrieve all orders');

  console.log('\n🎉 ALL ORDER DELIVERY WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
