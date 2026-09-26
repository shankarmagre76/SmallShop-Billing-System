import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import Pagination from "../../components/common/Pagination";
import BillFilters from "../../components/bills/BillFilters";
import BillsTable from "../../components/bills/BillsTable";
import * as billService from "../../services/billService";
import { getErrorMessage } from "../../utils/errorHandler";
import { toISTDateString } from "../../utils/formatters";
import { ROUTES } from "../../constants/routes";

const BillsListPage = () => {
  const navigate = useNavigate();

  const [billsData, setBillsData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBills = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const res = await billService.getBills(page, 10);
      setBillsData({
        items: Array.isArray(res.items) ? res.items : Array.isArray(res) ? res : [],
        totalCount: res.totalCount ?? (Array.isArray(res.items) ? res.items.length : 0),
        page: res.page || page,
        pageSize: res.pageSize || 10,
        totalPages: res.totalPages || 1,
      });
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to view bills history.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills(currentPage);
  }, [currentPage, fetchBills]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleDateFilterChange = (dateStr) => {
    setDateFilter(dateStr);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Filter bills on frontend by billNumber, customerName, or date (in IST)
  const filteredBills = (billsData.items || []).filter((bill) => {
    const matchesQuery =
      !searchQuery.trim() ||
      bill.billNumber?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      bill.customerName?.toLowerCase().includes(searchQuery.trim().toLowerCase());

    const matchesDate =
      !dateFilter ||
      (bill.createdAt && toISTDateString(bill.createdAt) === dateFilter);

    return matchesQuery && matchesDate;
  });

  return (
    <div className="container-fluid p-0">
      <PageHeader
        title="Bills History"
        subtitle="View and manage previously generated customer invoices and sales transactions."
      >
        <Link to={ROUTES.BILLING} className="btn btn-primary d-flex align-items-center gap-2 py-2">
          <i className="bi bi-plus-lg"></i>
          <span>Create New Bill</span>
        </Link>
      </PageHeader>

      <ErrorMessage message={error} onDismiss={() => setError("")} />

      {/* Search & Date Filter controls */}
      <BillFilters
        onSearchChange={handleSearchChange}
        onDateFilterChange={handleDateFilterChange}
        initialSearch={searchQuery}
      />

      {/* Bills Table / Loading / Empty Container */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          {loading ? (
            <div className="py-5">
              <LoadingSpinner message="Fetching bill transaction records..." />
            </div>
          ) : (
            <BillsTable
              bills={filteredBills}
              onAddNewBill={() => navigate(ROUTES.BILLING)}
            />
          )}
        </div>

        {!loading && billsData.totalCount > 0 && (
          <Pagination
            currentPage={billsData.page}
            totalPages={billsData.totalPages}
            totalCount={billsData.totalCount}
            pageSize={billsData.pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default BillsListPage;
