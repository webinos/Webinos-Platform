///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: Library. </summary>
	public partial class LibraryRelations
	{
		/// <summary>CTor</summary>
		public LibraryRelations()
		{
		}

		/// <summary>Gets all relations of the LibraryEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.PolicyEntityUsingLibraryId);
			toReturn.Add(this.PolicyDocumentEntityUsingLibraryId);
			toReturn.Add(this.QueryEntityUsingLibraryId);


			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between LibraryEntity and PolicyEntity over the 1:n relation they have, using the relation between the fields:
		/// Library.Id - Policy.LibraryId
		/// </summary>
		public virtual IEntityRelation PolicyEntityUsingLibraryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Policy" , true);
				relation.AddEntityFieldPair(LibraryFields.Id, PolicyFields.LibraryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("LibraryEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between LibraryEntity and PolicyDocumentEntity over the 1:n relation they have, using the relation between the fields:
		/// Library.Id - PolicyDocument.LibraryId
		/// </summary>
		public virtual IEntityRelation PolicyDocumentEntityUsingLibraryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "PolicyDocument" , true);
				relation.AddEntityFieldPair(LibraryFields.Id, PolicyDocumentFields.LibraryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("LibraryEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyDocumentEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between LibraryEntity and QueryEntity over the 1:n relation they have, using the relation between the fields:
		/// Library.Id - Query.LibraryId
		/// </summary>
		public virtual IEntityRelation QueryEntityUsingLibraryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Query" , true);
				relation.AddEntityFieldPair(LibraryFields.Id, QueryFields.LibraryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("LibraryEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("QueryEntity", false);
				return relation;
			}
		}



		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
