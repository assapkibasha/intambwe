// src/routers/inventoryRoutes.jsx
import { Outlet } from 'react-router-dom';
import InventoryDashboard from '../pages/InventoryDashboard';
import SupplierManagement from '../pages/SupplierManagement';
import PurchaseOrders from '../pages/PurchaseOrders';
import InventoryReports from '../pages/InventoryReports';

const inventoryRoutes = [
  {
    path: 'inventory',
    element: <Outlet />,
    children: [
      {
        index: true,
        element: <InventoryDashboard />
      },
      {
        path: 'products',
        element: <InventoryDashboard />
      },
      {
        path: 'categories',
        element: <InventoryDashboard />
      },
      {
        path: 'suppliers',
        element: <SupplierManagement />
      },
      {
        path: 'purchase-orders',
        element: <PurchaseOrders />
      },
      {
        path: 'reports',
        element: <InventoryReports />
      },
      {
        path: 'stock-in',
        element: <InventoryDashboard />
      },
      {
        path: 'stock-out',
        element: <InventoryDashboard />
      }
    ]
  }
];

export default inventoryRoutes;
