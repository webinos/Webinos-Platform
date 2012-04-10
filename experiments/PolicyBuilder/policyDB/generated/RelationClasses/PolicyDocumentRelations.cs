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
	/// <summary>Implements the static Relations variant for the entity: PolicyDocument. </summary>
	public partial class PolicyDocumentRelations
	{
		/// <summary>CTor</summary>
		public PolicyDocumentRelations()
		{
		}

		/// <summary>Gets all relations of the PolicyDocumentEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();


			toReturn.Add(this.LibraryEntityUsingLibraryId);
			toReturn.Add(this.PolicyLinkEntityUsingPolicyLinkId);
			return toReturn;
		}

		#region Class Property Declarations



		/// <summary>Returns a new IEntityRelation object, between PolicyDocumentEntity and LibraryEntity over the m:1 relation they have, using the relation between the fields:
		/// PolicyDocument.LibraryId - Library.Id
		/// </summary>
		public virtual IEntityRelation LibraryEntityUsingLibraryId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Library", false);
				relation.AddEntityFieldPair(LibraryFields.Id, PolicyDocumentFields.LibraryId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("LibraryEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyDocumentEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between PolicyDocumentEntity and PolicyLinkEntity over the m:1 relation they have, using the relation between the fields:
		/// PolicyDocument.PolicyLinkId - PolicyLink.Id
		/// </summary>
		public virtual IEntityRelation PolicyLinkEntityUsingPolicyLinkId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "PolicyLink", false);
				relation.AddEntityFieldPair(PolicyLinkFields.Id, PolicyDocumentFields.PolicyLinkId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyDocumentEntity", true);
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
