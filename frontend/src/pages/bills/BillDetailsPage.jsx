import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import InvoiceView from "../../components/bills/InvoiceView";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import * as billService from "../../services/billService";
import { getErrorMessage } from "../../utils/errorHandler";
import { ROUTES } from "../../constants/routes";

const BillDetailsPage = () => {
  const { id } = useParams();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBill = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await billService.getBillById(id);
        if (isMounted) {
          setBill(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response && err.response.status === 404) {
            setNotFound(true);
          } else if (err.response && err.response.status === 403) {
            setError("You do not have permission to view this bill.");
          } else {
            setError(getErrorMessage(err));
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBill();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-5">
        <LoadingSpinner message={`Loading invoice #${id}...`} fullScreen />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm mx-auto p-4" style={{ maxWidth: "480px" }}>
          <i className="bi bi-file-earmark-x text-warning display-3 mb-3"></i>
          <h4 className="fw-bold mb-2">Bill Not Found</h4>
          <p className="text-muted small mb-4">
            The requested invoice (ID: #{id}) does not exist or has been removed.
          </p>
          <Link to={ROUTES.BILLS} className="btn btn-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Bills History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ErrorMessage message={error} onDismiss={() => setError("")} />
      {bill && <InvoiceView bill={bill} />}
    </div>
  );
};

export default BillDetailsPage;
